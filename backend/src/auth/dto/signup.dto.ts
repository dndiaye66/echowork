import { IsNotEmpty, IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Username is required' })
  username!: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  email?: string;
}
