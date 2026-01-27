import { IsNumberString, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for validating company ID parameter
 */
export class CompanyIdParamDto {
  @IsNumberString()
  @Transform(({ value }) => parseInt(value, 10))
  @IsPositive({ message: 'Company ID must be a positive number' })
  id: number;
}

/**
 * DTO for validating category ID parameter
 */
export class CategoryIdParamDto {
  @IsNumberString()
  @Transform(({ value }) => parseInt(value, 10))
  @IsPositive({ message: 'Category ID must be a positive number' })
  categoryId: number;
}
