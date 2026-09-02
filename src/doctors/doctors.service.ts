import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { Doctor } from './schemas/doctor.schema.js';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name)
    private readonly doctorModel: Model<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    if (
      createDoctorDto.availableDays.includes('All Days') &&
      createDoctorDto.availableDays.length > 1
    ) {
      throw new BadRequestException(
        '"All Days" cannot be combined with individual weekdays',
      );
    }

    const doctor = new this.doctorModel({
      userId: createDoctorDto.userId,
      fullName: createDoctorDto.fullName,
      medicalRegistrationNumber:
        createDoctorDto.medicalRegistrationNumber,
      qualification: createDoctorDto.qualification,
      specialization: createDoctorDto.specialization,
      departmentId: createDoctorDto.departmentId,
      departmentName: createDoctorDto.departmentName,
      opdRoomNumber: createDoctorDto.opdRoomNumber,
      consultationFee: createDoctorDto.consultationFee,
      availableDays: createDoctorDto.availableDays,
      opdTimings: createDoctorDto.opdTimings,
      phone: createDoctorDto.phone,
      email: createDoctorDto.email,
      isAvailableToday:
        createDoctorDto.isAvailableToday ?? true,
    });

    try {
      return await doctor.save();
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        const duplicateField =
          Object.keys(error.keyPattern ?? {})[0] ??
          'unique field';

        throw new ConflictException(
          `A doctor with this ${duplicateField} already exists`,
        );
      }

      throw error;
    }
  }

  private isDuplicateKeyError(
    error: unknown,
  ): error is {
    code: number;
    keyPattern?: Record<string, number>;
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    );
  }
}