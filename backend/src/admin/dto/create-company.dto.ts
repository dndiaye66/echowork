import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, IsEnum } from 'class-validator';

enum CompanySize { TPE = 'TPE', PME = 'PME', GRANDE = 'GRANDE' }

export class CreateCompanyDto {
  @IsString() @IsNotEmpty({ message: 'Name is required' }) name!: string;
  @IsString() @IsNotEmpty({ message: 'Slug is required' }) slug!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsInt() @IsNotEmpty({ message: 'Category ID is required' }) categoryId!: number;
  @IsString() @IsOptional() tel?: string;
  @IsString() @IsOptional() ville?: string;
  @IsString() @IsOptional() adresse?: string;
  @IsString() @IsOptional() activite?: string;
  @IsString() @IsOptional() ninea?: string;
  @IsString() @IsOptional() rccm?: string;
  @IsEnum(CompanySize) @IsOptional() size?: CompanySize;
  @IsBoolean() @IsOptional() isVerified?: boolean;
}
