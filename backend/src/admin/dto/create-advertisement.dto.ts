import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateAdvertisementDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content!: string;

  @IsString({ message: 'Image URL must be a string' })
  @IsOptional()
  imageUrl?: string;

  @IsInt({ message: 'Company ID must be an integer' })
  @IsOptional()
  companyId?: number;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate!: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  @IsNotEmpty({ message: 'End date is required' })
  endDate!: string;

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
