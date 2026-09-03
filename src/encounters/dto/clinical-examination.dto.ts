import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class GeneralPhysicalExamDto {
  @IsOptional()
  @IsBoolean()
  pallor?: boolean;

  @IsOptional()
  @IsBoolean()
  icterus?: boolean;

  @IsOptional()
  @IsBoolean()
  cyanosis?: boolean;

  @IsOptional()
  @IsBoolean()
  clubbing?: boolean;

  @IsOptional()
  @IsBoolean()
  lymphadenopathy?: boolean;

  @IsOptional()
  @IsBoolean()
  edema?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class ClinicalExaminationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralPhysicalExamDto)
  general?: GeneralPhysicalExamDto;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  cardiovascular?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  respiratory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  abdomen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  neurological?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  musculoskeletal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  skin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  otherFindings?: string;
}