import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';

import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { ListDoctorsQueryDto } from './dto/list-doctors-query.dto.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { Doctor } from './schemas/doctor.schema.js';

type DoctorListFilter = {
  isDeleted: false;
  departmentId?: string;
  specialization?: string;
  isAvailableToday?: boolean;
  $or?: Array<
    | { fullName: RegExp }
    | { medicalRegistrationNumber: RegExp }
    | { email: RegExp }
    | { phone: RegExp }
  >;
};

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
      medicalRegistrationNumber: createDoctorDto.medicalRegistrationNumber,
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
      isAvailableToday: createDoctorDto.isAvailableToday ?? true,
    });

    try {
      return await doctor.save();
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        const duplicateField =
          Object.keys(error.keyPattern ?? {})[0] ?? 'unique field';

        throw new ConflictException(
          `A doctor with this ${duplicateField} already exists`,
        );
      }

      throw error;
    }
  }

  async findAll(query: ListDoctorsQueryDto) {
    const {
      page,
      limit,
      search,
      departmentId,
      specialization,
      isAvailableToday,
    } = query;

    const filter: DoctorListFilter = {
      isDeleted: false,
    };

    if (departmentId !== undefined) {
      filter.departmentId = departmentId;
    }

    if (specialization !== undefined) {
      filter.specialization = specialization;
    }

    if (isAvailableToday !== undefined) {
      filter.isAvailableToday = isAvailableToday;
    }

    if (search !== undefined) {
      const safeSearch = new RegExp(this.escapeRegExp(search), 'i');

      filter.$or = [
        { fullName: safeSearch },
        { medicalRegistrationNumber: safeSearch },
        { email: safeSearch },
        { phone: safeSearch },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.doctorModel
        .find(filter)
        .select('-isDeleted -deletedAt')
        .sort({
          fullName: 1,
          _id: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.doctorModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    const doctor = await this.doctorModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .select('-isDeleted -deletedAt')
      .lean()
      .exec();

    if (doctor === null) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    if (Object.keys(updateDoctorDto).length === 0) {
      throw new BadRequestException(
        'At least one field is required for update',
      );
    }

    if (
      updateDoctorDto.availableDays?.includes('All Days') &&
      updateDoctorDto.availableDays.length > 1
    ) {
      throw new BadRequestException(
        '"All Days" cannot be combined with individual weekdays',
      );
    }

    const updateData: Partial<Doctor> = {};

    if (updateDoctorDto.userId !== undefined) {
      updateData.userId = updateDoctorDto.userId;
    }

    if (updateDoctorDto.fullName !== undefined) {
      updateData.fullName = updateDoctorDto.fullName;
    }

    if (updateDoctorDto.medicalRegistrationNumber !== undefined) {
      updateData.medicalRegistrationNumber =
        updateDoctorDto.medicalRegistrationNumber;
    }

    if (updateDoctorDto.qualification !== undefined) {
      updateData.qualification = updateDoctorDto.qualification;
    }

    if (updateDoctorDto.specialization !== undefined) {
      updateData.specialization = updateDoctorDto.specialization;
    }

    if (updateDoctorDto.departmentId !== undefined) {
      updateData.departmentId = updateDoctorDto.departmentId;
    }

    if (updateDoctorDto.departmentName !== undefined) {
      updateData.departmentName = updateDoctorDto.departmentName;
    }

    if (updateDoctorDto.opdRoomNumber !== undefined) {
      updateData.opdRoomNumber = updateDoctorDto.opdRoomNumber;
    }

    if (updateDoctorDto.consultationFee !== undefined) {
      updateData.consultationFee = updateDoctorDto.consultationFee;
    }

    if (updateDoctorDto.availableDays !== undefined) {
      updateData.availableDays = updateDoctorDto.availableDays;
    }

    if (updateDoctorDto.opdTimings !== undefined) {
      updateData.opdTimings = updateDoctorDto.opdTimings;
    }

    if (updateDoctorDto.phone !== undefined) {
      updateData.phone = updateDoctorDto.phone;
    }

    if (updateDoctorDto.email !== undefined) {
      updateData.email = updateDoctorDto.email;
    }

    if (updateDoctorDto.isAvailableToday !== undefined) {
      updateData.isAvailableToday = updateDoctorDto.isAvailableToday;
    }

    try {
      const doctor = await this.doctorModel
        .findOneAndUpdate(
          {
            _id: id,
            isDeleted: false,
          },
          {
            $set: updateData,
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .select('-isDeleted -deletedAt')
        .lean()
        .exec();

      if (doctor === null) {
        throw new NotFoundException('Doctor not found');
      }

      return doctor;
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        const duplicateField =
          Object.keys(error.keyPattern ?? {})[0] ?? 'unique field';

        throw new ConflictException(
          `A doctor with this ${duplicateField} already exists`,
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    const deletedDoctor = await this.doctorModel
      .findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            isAvailableToday: false,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .select('_id fullName')
      .lean()
      .exec();

    if (deletedDoctor === null) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      message: 'Doctor archived successfully',
      doctorId: deletedDoctor._id,
      fullName: deletedDoctor.fullName,
    };
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  private isDuplicateKeyError(error: unknown): error is {
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
