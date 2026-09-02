import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { DoctorsModule } from '../doctors/doctors.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import {
DoctorJwtAuthGuard,
} from './guards/doctor-jwt-auth.guard.js';

@Module({
  imports: [
    DoctorsModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        secret:
          configService.getOrThrow<string>(
            'JWT_SECRET',
          ),

        signOptions: {
          expiresIn:
            configService.getOrThrow<number>(
              'JWT_EXPIRES_IN_SECONDS',
            ),
        },
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [
  AuthService,
  {
    provide: APP_GUARD,
    useClass: DoctorJwtAuthGuard,
  },
],
})
export class AuthModule {}