import { IsNotEmpty, IsString, IsInt, IsOptional, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug!: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsOptional()
  imageUrl?: string;

  @IsInt({ message: 'Category ID must be an integer' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId!: number;
}
