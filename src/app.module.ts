import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PatientsModule } from './patients/patients.module.js';
import { DoctorsModule } from './doctors/doctors.module.js';
import { NursesModule } from './nurses/nurses.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { EncountersModule } from './encounters/encounters.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string()
          .min(32)
          .required(),

        JWT_EXPIRES_IN_SECONDS: Joi.number()
          .integer()
          .min(60)
          .max(86400)
          .default(1800),

        TEST_DOCTOR_PASSWORD: Joi.string()
          .min(12)
          .required(),
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),

        PORT: Joi.number().port().default(3001),
        MONGODB_URI: Joi.string()
          .uri({
            scheme: ['mongodb', 'mongodb+srv'],
          })
          .required(),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 5000,
        retryAttempts: 3,
        retryDelay: 1000,
      }),
    }),
    PatientsModule,
    DoctorsModule,
    NursesModule,
    AppointmentsModule,
    EncountersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }