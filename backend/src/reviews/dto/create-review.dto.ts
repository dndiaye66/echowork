import { IsInt, IsNotEmpty, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  @IsNotEmpty({ message: 'Rating is required' })
  rating!: number;

  @IsString({ message: 'Comment must be a string' })
  @IsNotEmpty({ message: 'Comment is required' })
  comment!: string;

  @IsInt({ message: 'Company ID must be an integer' })
  @IsPositive({ message: 'Company ID must be a positive number' })
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId!: number;
}
