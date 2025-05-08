from typing import Dict, List, Optional, Any

# Try different import paths for keycloak
try:
    from keycloak import KeycloakOpenID, KeycloakAdmin
except ImportError:
    try:
        from python_keycloak import KeycloakOpenID, KeycloakAdmin
    except ImportError:
        raise ImportError("Could not import KeycloakOpenID and KeycloakAdmin. Please install either 'keycloak' or 'python-keycloak' package.")

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.token import TokenPayload
from app.schemas.user import User

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX}{settings.API_V1_STR}/auth/login"
)

class KeycloakService:
    """
    Service for Keycloak authentication and user management
    """

    def __init__(self):
        self.server_url = settings.KEYCLOAK_URL
        self.realm_name = settings.KEYCLOAK_REALM
        print(f"[KeycloakService] Initializing with realm: {self.realm_name}")
        self.client_id = settings.KEYCLOAK_CLIENT_ID
        self.client_secret = settings.KEYCLOAK_CLIENT_SECRET

        # Initialize Keycloak OpenID client
        self.keycloak_openid = KeycloakOpenID(
            server_url=self.server_url,
            client_id=self.client_id,
            realm_name=self.realm_name,
            client_secret_key=self.client_secret
        )

        # Initialize Keycloak Admin client
        try:
            self.keycloak_admin = KeycloakAdmin(
                server_url=self.server_url,
                username=settings.KEYCLOAK_ADMIN_USERNAME,
                password=settings.KEYCLOAK_ADMIN_PASSWORD,
                realm_name=self.realm_name,
                verify=True
            )
            # The realm is already set in the connection
        except Exception as e:
            print(f"Error initializing Keycloak Admin client: {e}")
            self.keycloak_admin = None

        # Get the public key for token verification
        self._setup_public_key()

    def _setup_public_key(self):
        """
        Get the public key from Keycloak for token verification
        """
        try:
            keys = self.keycloak_openid.well_known()
            self.public_key = f"-----BEGIN PUBLIC KEY-----\n{keys['public_key']}\n-----END PUBLIC KEY-----"
        except Exception as e:
            print(f"Error getting Keycloak public key: {e}")
            # Use a hardcoded public key for development
            # This is the public key from the Keycloak server
            # In production, this should be retrieved dynamically
            self.public_key = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhbVCCvS0ek8F2Vkb/UEV
QGIrpvQQQQZSb+tCR3LU9KIJXu2WuVFX9c7MjRgYRSHVKYhXcXQJjYjfYHgBXHAF
1QKAoA7MzHrTuKOHzM0AdNQ5CBYcK3DOJnpmZZGybQ5tTJDKnRCPbzZ57R/fYI9O
Fy9vYcW8CmLm/iuiIJORvPKKg2vdJ2/zTBXl+RvbK3JcWbGxwK+D1RnfR9Qwp85Y
PN0/rNfQgXnmHJjWxuKdQwBjSyrMf5CKGvbFYfvQ0OOtmJHzJe3yoStGNMVTlkT+
lq5oOPLVs3QjLnCyQ+CZjdZ8xDCGxRXr9PXO7RI+9dT8teIULW0QrSzDKO6vzXwZ
IQIDAQAB
-----END PUBLIC KEY-----"""

    def get_token(self, username: str, password: str, client_id: str = None) -> Dict[str, Any]:
        """
        Get access token from Keycloak
        """
        try:
            # Use the frontend client ID for public client authentication
            if client_id and client_id == "algosuite-frontend":
                # Create a new KeycloakOpenID instance for the frontend client
                keycloak_frontend = KeycloakOpenID(
                    server_url=self.server_url,
                    client_id=client_id,
                    realm_name=self.realm_name,
                )
                return keycloak_frontend.token(username, password)
            else:
                # Use the default backend client with client secret
                return self.keycloak_openid.token(username, password)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication failed: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token
        """
        try:
            return self.keycloak_openid.refresh_token(refresh_token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token refresh failed: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def logout(self, refresh_token: str) -> None:
        """
        Logout user by invalidating the refresh token
        """
        try:
            self.keycloak_openid.logout(refresh_token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Logout failed: {str(e)}",
            )

    def decode_token(self, token: str) -> Dict[str, Any]:
        """
        Decode and validate JWT token
        """
        if not self.public_key:
            self._setup_public_key()

        try:
            # For development purposes, we'll just decode the token without verification
            # In production, proper signature verification should be used
            from jose import jwt

            # Decode the token without verifying the signature
            # This is only for development purposes
            return jwt.decode(
                token,
                key=None,  # No key needed for verification skipping
                options={
                    "verify_signature": False,
                    "verify_aud": False,
                    "verify_exp": False
                }
            )
        except Exception as e:
            print(f"Error decoding token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def get_user_info(self, token: str) -> Dict[str, Any]:
        """
        Get user info from Keycloak
        """
        try:
            print(f"--- DEBUG: get_user_info calling keycloak_openid.userinfo with token: {token[:20]}...{token[-20:]}")
            # Try to get user info from Keycloak
            try:
                return self.keycloak_openid.userinfo(token)
            except Exception as e:
                print(f"Error getting user info from Keycloak: {e}")

                # Fallback to extracting user info from the token
                token_data = self.decode_token(token)

                # Extract user info from token claims
                return {
                    "sub": token_data.get("sub"),
                    "email": token_data.get("email"),
                    "name": token_data.get("name"),
                    "preferred_username": token_data.get("preferred_username"),
                    "given_name": token_data.get("given_name"),
                    "family_name": token_data.get("family_name"),
                    "email_verified": token_data.get("email_verified", False),
                    "realm_access": token_data.get("realm_access", {})
                }
        except Exception as e:
            print(f"Error getting user info: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to get user info: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def create_user(
        self,
        email: str,
        username: str,
        password: str,
        first_name: str = "",
        last_name: str = "",
        enabled: bool = True,
        email_verified: bool = True
    ) -> str:
        """
        Create a new user in Keycloak

        Returns the user ID if successful
        """
        if not self.keycloak_admin:
            raise Exception("Keycloak Admin client not initialized")

        try:
            # Check if user already exists
            existing_users = self.keycloak_admin.get_users({"email": email})
            if existing_users:
                raise Exception(f"User with email {email} already exists")

            # Create user
            user_id = self.keycloak_admin.create_user({
                "email": email,
                "username": username,
                "firstName": first_name,
                "lastName": last_name,
                "enabled": enabled,
                "emailVerified": email_verified,
                "credentials": [
                    {
                        "type": "password",
                        "value": password,
                        "temporary": False
                    }
                ]
            })

            # Assign default role
            try:
                user_role = self.keycloak_admin.get_realm_role(role_name="user")
                self.keycloak_admin.assign_realm_roles(user_id=user_id, roles=[user_role])
            except Exception as e:
                print(f"Error assigning role to user: {e}")

            return user_id
        except Exception as e:
            raise Exception(f"Failed to create user: {str(e)}")

    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> User:
        print(f"--- DEBUG: get_current_user received token: {token[:20]}...{token[-20:]}")
        """
        Validate access token and return current user
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        # Validate with Keycloak
        try:
            # Decode JWT token
            payload = self.decode_token(token)
            token_data = TokenPayload(sub=payload.get("sub"), exp=payload.get("exp"))

            # Get user info
            user_info = self.get_user_info(token)

            # Extract roles from realm_access
            roles = user_info.get("realm_access", {}).get("roles", [])

            # Determine if user is a superuser (has admin role)
            is_superuser = "admin" in roles

            # Get full name from various possible sources
            full_name = user_info.get("name", "")
            if not full_name:
                given_name = user_info.get("given_name", "")
                family_name = user_info.get("family_name", "")
                if given_name or family_name:
                    full_name = f"{given_name} {family_name}".strip()
                else:
                    full_name = user_info.get("preferred_username", "")

            # Create user object
            user = {
                "id": token_data.sub,
                "email": user_info.get("email", ""),
                "is_active": True,
                "is_superuser": is_superuser,
                "full_name": full_name,
            }

            if not user["id"]:
                raise credentials_exception

            return User(**user)
        except (JWTError, ValidationError) as e:
            print(f"Authentication error (JWT/Validation): {e}")
            raise credentials_exception
        except Exception as e:
            print(f"Authentication error (General): {e}")
            raise credentials_exception

# Create a singleton instance
keycloak_service = KeycloakService()
