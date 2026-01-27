import { IsInt, IsPositive, IsString, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for validating company ID parameter
 */
export class CompanyIdParamDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Company ID must be an integer' })
  @IsPositive({ message: 'Company ID must be a positive number' })
  id!: number;
}

/**
 * DTO for validating category ID parameter
 */
export class CategoryIdParamDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Category ID must be an integer' })
  @IsPositive({ message: 'Category ID must be a positive number' })
  categoryId!: number;
}

/**
 * DTO for validating category slug parameter
 */
export class CategorySlugParamDto {
  @IsString({ message: 'Category slug must be a string' })
  @IsNotEmpty({ message: 'Category slug cannot be empty' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Category slug must be lowercase alphanumeric with hyphens',
  })
  slug!: string;
}
