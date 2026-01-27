import { IsInt, IsPositive } from 'class-validator';
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
