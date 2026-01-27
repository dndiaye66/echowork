import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateCompanyDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Slug must be a string' })
  @IsOptional()
  slug?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Image URL must be a string' })
  @IsOptional()
  imageUrl?: string;

  @IsInt({ message: 'Category ID must be an integer' })
  @IsOptional()
  categoryId?: number;
}
