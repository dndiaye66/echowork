import { IsString, IsInt, IsOptional, IsBoolean, IsEnum } from 'class-validator';

enum CompanySize { TPE = 'TPE', PME = 'PME', GRANDE = 'GRANDE' }

export class UpdateCompanyDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() slug?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsInt() @IsOptional() categoryId?: number;
  @IsString() @IsOptional() tel?: string;
  @IsString() @IsOptional() ville?: string;
  @IsString() @IsOptional() adresse?: string;
  @IsString() @IsOptional() activite?: string;
  @IsString() @IsOptional() ninea?: string;
  @IsString() @IsOptional() rccm?: string;
  @IsEnum(CompanySize) @IsOptional() size?: CompanySize;
  @IsBoolean() @IsOptional() isVerified?: boolean;
}
