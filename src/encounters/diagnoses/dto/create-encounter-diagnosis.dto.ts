import { Transform } from 'class-transformer';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { DIAGNOSIS_TYPES } from '../diagnosis.constants.js';

import type { DiagnosisType } from '../diagnosis.constants.js';

const trimText = ({ value }: { value: unknown }) => {
  return typeof value === 'string' ? value.trim() : value;
};

export class CreateEncounterDiagnosisDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  @Matches(/^[A-Z][0-9][0-9A-Z](?:\.[0-9A-Z]{1,4})?$/, {
    message: 'icd10Code must be a valid ICD-10 code format',
  })
  icd10Code!: string;

  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  diagnosisName!: string;

  @IsIn(DIAGNOSIS_TYPES)
  type!: DiagnosisType;

  @IsBoolean()
  isPrimary!: boolean;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
