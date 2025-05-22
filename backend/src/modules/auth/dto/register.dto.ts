// Removed all validation decorators for debugging
export class RegisterDto {
  email!: string;
  password!: string;
  firstName?: string;
  lastName?: string;
  full_name?: string;
}

