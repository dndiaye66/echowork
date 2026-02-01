import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(['USER', 'ADMIN', 'MODERATOR'])
  @IsOptional()
  role?: 'USER' | 'ADMIN' | 'MODERATOR';

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  password?: string;
}
