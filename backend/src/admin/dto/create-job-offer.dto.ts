import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateJobOfferDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @IsString({ message: 'Salary must be a string' })
  @IsOptional()
  salary?: string;

  @IsString({ message: 'Location must be a string' })
  @IsOptional()
  location?: string;

  @IsInt({ message: 'Company ID must be an integer' })
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId!: number;

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
