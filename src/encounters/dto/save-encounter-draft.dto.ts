import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { ClinicalExaminationDto } from './clinical-examination.dto.js';
import {
  ClinicalReferralDto,
  FollowUpPlanDto,
} from './clinical-plan.dto.js';
import { VitalSignsDto } from './vital-signs.dto.js';

export class SaveEncounterDraftDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  historyOfPresentIllness?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  pastMedicalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  pastSurgicalHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  familyHistory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  socialHistory?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(250, { each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(250, { each: true })
  currentMedications?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitals?: VitalSignsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClinicalExaminationDto)
  examination?: ClinicalExaminationDto;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  clinicalAssessment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  treatmentPlan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  doctorNotes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ClinicalReferralDto)
  referrals?: ClinicalReferralDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FollowUpPlanDto)
  followUp?: FollowUpPlanDto;
}