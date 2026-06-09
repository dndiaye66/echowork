import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @MinLength(10, { message: 'La réponse doit contenir au moins 10 caractères' })
  @MaxLength(1000, { message: 'La réponse ne peut pas dépasser 1000 caractères' })
  content!: string;
}
