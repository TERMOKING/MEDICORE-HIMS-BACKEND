import { PartialType } from '@nestjs/mapped-types';

import { CreateEncounterDiagnosisDto } from './create-encounter-diagnosis.dto.js';

export class UpdateEncounterDiagnosisDto extends PartialType(
  CreateEncounterDiagnosisDto,
) {}
