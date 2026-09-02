import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PatientsController } from './patients.controller.js';
import { PatientsService } from './patients.service.js';
import { Patient, PatientSchema } from './schemas/patient.schema.js';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [MongooseModule],
})
export class PatientsModule {}