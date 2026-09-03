import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  REFERRAL_PRIORITIES,
} from '../schemas/clinical-plan.schema.js';

import type {
  ReferralPriority,
} from '../schemas/clinical-plan.schema.js';

export class ClinicalReferralDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  specialty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  doctorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;

  @IsOptional()
  @IsIn(REFERRAL_PRIORITIES)
  priority?: ReferralPriority;
}

export class FollowUpPlanDto {
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  intervalDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  suggestedInterval?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;
}