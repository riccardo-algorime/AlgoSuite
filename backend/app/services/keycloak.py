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
            # Set the target realm
            self.keycloak_admin.realm_name = self.realm_name
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
            self.public_key = None

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
            return self.keycloak_openid.decode_token(
                token,
                key=self.public_key,
                options={"verify_signature": True, "verify_aud": False, "exp": True}
            )
        except Exception as e:
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
            return self.keycloak_openid.userinfo(token)
        except Exception as e:
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
        """
        Validate access token and return current user
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            # Decode JWT token
            payload = self.decode_token(token)
            token_data = TokenPayload(sub=payload.get("sub"), exp=payload.get("exp"))

            # Get user info
            user_info = self.get_user_info(token)

            # Create user object
            user = {
                "id": token_data.sub,
                "email": user_info.get("email", ""),
                "is_active": True,
                "is_superuser": "admin" in user_info.get("realm_access", {}).get("roles", []),
                "full_name": user_info.get("name", ""),
            }

            if not user:
                raise credentials_exception

            return User(**user)
        except (JWTError, ValidationError, Exception) as e:
            print(f"Authentication error: {e}")
            raise credentials_exception

# Create a singleton instance
keycloak_service = KeycloakService()
