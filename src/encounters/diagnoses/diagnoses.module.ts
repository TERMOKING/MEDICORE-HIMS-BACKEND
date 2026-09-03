import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Encounter, EncounterSchema } from '../schemas/encounter.schema.js';

import {
  EncounterDiagnosis,
  EncounterDiagnosisSchema,
} from './schemas/encounter-diagnosis.schema.js';

import { DiagnosesService } from './diagnoses.service.js';
import { DiagnosesController } from './diagnoses.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Encounter.name,
        schema: EncounterSchema,
      },
      {
        name: EncounterDiagnosis.name,
        schema: EncounterDiagnosisSchema,
      },
    ]),
  ],
  providers: [DiagnosesService],
  controllers: [DiagnosesController],
})
export class DiagnosesModule {}
