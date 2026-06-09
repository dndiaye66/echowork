import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SocialLinksDto {
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() twitter?: string;
}

class DayHoursDto {
  @IsOptional() @IsString() open?: string;
  @IsOptional() @IsString() close?: string;
  @IsOptional() closed?: boolean;
}

class OpeningHoursDto {
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) lundi?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) mardi?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) mercredi?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) jeudi?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) vendredi?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) samedi?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) dimanche?: DayHoursDto;
}

export class UpdateCompanyProfileDto {
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() tel?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() @MaxLength(200) website?: string;
  @IsOptional() @IsString() imageUrl?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OpeningHoursDto)
  openingHours?: OpeningHoursDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
