import { IsEnum, IsInt, IsOptional, IsString, IsBoolean, MinLength, MaxLength, IsPositive } from 'class-validator';
import { ReportCategory } from '@prisma/client';

export class CreateReportDto {
  @IsInt() @IsPositive()
  companyId!: number;

  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @IsString()
  @MinLength(50, { message: 'La description doit contenir au moins 50 caractères' })
  @MaxLength(2000)
  description!: string;

  @IsOptional() @IsString()
  evidence?: string;

  @IsOptional() @IsBoolean()
  isAnonymous?: boolean;
}
