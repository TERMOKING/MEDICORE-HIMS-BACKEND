import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorsModule } from '../doctors/doctors.module.js';
import { PatientsModule } from '../patients/patients.module.js';

import {
  Appointment,
  AppointmentSchema,
} from './schemas/appointment.schema.js';
import { AppointmentsService } from './appointments.service.js';
import { AppointmentsController } from './appointments.controller.js';
import { EncountersModule } from '../encounters/encounters.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },
    ]),
    DoctorsModule,
    PatientsModule,
    EncountersModule,
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
