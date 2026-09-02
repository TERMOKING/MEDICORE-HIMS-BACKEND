import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { timingSafeEqual } from 'node:crypto';

import { type Model } from 'mongoose';

import { Doctor } from '../doctors/schemas/doctor.schema.js';
import { DoctorLoginDto } from './dto/doctor-login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<Doctor>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async doctorLogin(
    loginDto: DoctorLoginDto,
  ) {
    const doctor = await this.doctorModel
      .findOne({
        _id: loginDto.userId,
        isDeleted: false,
      })
      .select(
        '_id fullName email specialization departmentId departmentName medicalRegistrationNumber',
      )
      .lean()
      .exec();

    const expectedPassword =
      this.configService.getOrThrow<string>(
        'TEST_DOCTOR_PASSWORD',
      );

    const passwordMatches =
      this.safeCompare(
        loginDto.password,
        expectedPassword,
      );

    if (!doctor || !passwordMatches) {
      throw new UnauthorizedException(
        'Invalid doctor ID or password',
      );
    }

    const doctorId = doctor._id.toString();

    const accessToken =
      await this.jwtService.signAsync({
        sub: doctorId,
        doctorId,
        tokenType: 'doctor',
      });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn:
        this.configService.getOrThrow<number>(
          'JWT_EXPIRES_IN_SECONDS',
        ),

      doctor: {
        _id: doctorId,
        fullName: doctor.fullName,
        email: doctor.email,
        specialization: doctor.specialization,
        departmentId: doctor.departmentId,
        departmentName: doctor.departmentName,
        medicalRegistrationNumber:
          doctor.medicalRegistrationNumber,
      },
    };
  }

  private safeCompare(
    suppliedValue: string,
    expectedValue: string,
  ): boolean {
    const suppliedBuffer =
      Buffer.from(suppliedValue);

    const expectedBuffer =
      Buffer.from(expectedValue);

    if (
      suppliedBuffer.length !==
      expectedBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(
      suppliedBuffer,
      expectedBuffer,
    );
  }
}