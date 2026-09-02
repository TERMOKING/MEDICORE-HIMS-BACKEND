import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  isValidObjectId,
  type Model,
} from 'mongoose';

import { CreateNurseDto } from './dto/create-nurse.dto.js';
import {
  ListNursesQueryDto,
} from './dto/list-nurses-query.dto.js';
import { UpdateNurseDto } from './dto/update-nurse.dto.js';
import type {
  NurseEditableStatus,
  NurseShift,
} from './nurse.constants.js';
import { Nurse } from './schemas/nurse.schema.js';

type NurseListFilter = {
  isDeleted: false;
  wardId?: string;
  departmentId?: string;
  shift?: NurseShift;
  isShiftActive?: boolean;
  status?: NurseEditableStatus;
  $or?: Array<
    | { fullName: RegExp }
    | { nursingRegistrationNumber: RegExp }
    | { qualification: RegExp }
    | { phone: RegExp }
    | { email: RegExp }
  >;
};

@Injectable()
export class NursesService {
  constructor(
    @InjectModel(Nurse.name)
    private readonly nurseModel: Model<Nurse>,
  ) {}

  async create(
    createNurseDto: CreateNurseDto,
  ): Promise<Nurse> {
    this.rejectNullValues(createNurseDto);

    const hasDepartmentId =
      createNurseDto.departmentId !== undefined;

    const hasDepartmentName =
      createNurseDto.departmentName !== undefined;

    if (hasDepartmentId !== hasDepartmentName) {
      throw new BadRequestException(
        'departmentId and departmentName must be provided together',
      );
    }

    const nurse = new this.nurseModel({
      userId: createNurseDto.userId,
      employeeId: createNurseDto.employeeId,
      fullName: createNurseDto.fullName,
      nursingRegistrationNumber:
        createNurseDto.nursingRegistrationNumber,
      qualification: createNurseDto.qualification,
      designation:
        createNurseDto.designation ?? 'Staff Nurse',
      departmentId: createNurseDto.departmentId,
      departmentName: createNurseDto.departmentName,
      wardId: createNurseDto.wardId,
      wardName: createNurseDto.wardName,
      shift: createNurseDto.shift,
      phone: createNurseDto.phone,
      email: createNurseDto.email,
      isShiftActive:
        createNurseDto.isShiftActive ?? true,
      assignedBeds:
        createNurseDto.assignedBeds ?? [],
      status: createNurseDto.status ?? 'active',
    });

    try {
      return await nurse.save();
    } catch (error: unknown) {
      this.handleDuplicateKeyError(error);
      throw error;
    }
  }

  async findAll(query: ListNursesQueryDto) {
    const {
      page,
      limit,
      search,
      wardId,
      departmentId,
      shift,
      isShiftActive,
      status,
      sortBy,
      sortOrder,
    } = query;

    const filter: NurseListFilter = {
      isDeleted: false,
    };

    if (wardId !== undefined) {
      filter.wardId = wardId;
    }

    if (departmentId !== undefined) {
      filter.departmentId = departmentId;
    }

    if (shift !== undefined) {
      filter.shift = shift;
    }

    if (isShiftActive !== undefined) {
      filter.isShiftActive = isShiftActive;
    }

    if (status !== undefined) {
      filter.status = status;
    }

    if (search !== undefined) {
      const safeSearch = new RegExp(
        this.escapeRegExp(search),
        'i',
      );

      filter.$or = [
        { fullName: safeSearch },
        { nursingRegistrationNumber: safeSearch },
        { qualification: safeSearch },
        { phone: safeSearch },
        { email: safeSearch },
      ];
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortDirection,
      _id: 1,
    };

    const [items, total] = await Promise.all([
      this.nurseModel
        .find(filter)
        .select('-isDeleted -deletedAt')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.nurseModel
        .countDocuments(filter)
        .exec(),
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
      throw new BadRequestException(
        'Invalid nurse ID',
      );
    }

    const nurse = await this.nurseModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .select('-isDeleted -deletedAt')
      .lean()
      .exec();

    if (nurse === null) {
      throw new NotFoundException(
        'Nurse not found',
      );
    }

    return nurse;
  }

  async update(
    id: string,
    updateNurseDto: UpdateNurseDto,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        'Invalid nurse ID',
      );
    }

    this.rejectNullValues(updateNurseDto);

    const updatesDepartment =
      updateNurseDto.departmentId !== undefined ||
      updateNurseDto.departmentName !== undefined;

    if (
      updatesDepartment &&
      (
        updateNurseDto.departmentId === undefined ||
        updateNurseDto.departmentName === undefined
      )
    ) {
      throw new BadRequestException(
        'departmentId and departmentName must be updated together',
      );
    }

    const updateData: Partial<Nurse> = {};

    if (updateNurseDto.userId !== undefined) {
      updateData.userId = updateNurseDto.userId;
    }

    if (updateNurseDto.employeeId !== undefined) {
      updateData.employeeId =
        updateNurseDto.employeeId;
    }

    if (updateNurseDto.fullName !== undefined) {
      updateData.fullName =
        updateNurseDto.fullName;
    }

    if (
      updateNurseDto.nursingRegistrationNumber !==
      undefined
    ) {
      updateData.nursingRegistrationNumber =
        updateNurseDto.nursingRegistrationNumber;
    }

    if (updateNurseDto.qualification !== undefined) {
      updateData.qualification =
        updateNurseDto.qualification;
    }

    if (updateNurseDto.designation !== undefined) {
      updateData.designation =
        updateNurseDto.designation;
    }

    if (updateNurseDto.departmentId !== undefined) {
      updateData.departmentId =
        updateNurseDto.departmentId;
    }

    if (
      updateNurseDto.departmentName !== undefined
    ) {
      updateData.departmentName =
        updateNurseDto.departmentName;
    }

    if (updateNurseDto.wardId !== undefined) {
      updateData.wardId = updateNurseDto.wardId;
    }

    if (updateNurseDto.wardName !== undefined) {
      updateData.wardName =
        updateNurseDto.wardName;
    }

    if (updateNurseDto.shift !== undefined) {
      updateData.shift = updateNurseDto.shift;
    }

    if (updateNurseDto.phone !== undefined) {
      updateData.phone = updateNurseDto.phone;
    }

    if (updateNurseDto.email !== undefined) {
      updateData.email = updateNurseDto.email;
    }

    if (
      updateNurseDto.isShiftActive !== undefined
    ) {
      updateData.isShiftActive =
        updateNurseDto.isShiftActive;
    }

    if (updateNurseDto.assignedBeds !== undefined) {
      updateData.assignedBeds =
        updateNurseDto.assignedBeds;
    }

    if (updateNurseDto.status !== undefined) {
      updateData.status = updateNurseDto.status;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'At least one field is required for update',
      );
    }

    try {
      const nurse = await this.nurseModel
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

      if (nurse === null) {
        throw new NotFoundException(
          'Nurse not found',
        );
      }

      return nurse;
    } catch (error: unknown) {
      this.handleDuplicateKeyError(error);
      throw error;
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        'Invalid nurse ID',
      );
    }

    const deletedNurse = await this.nurseModel
      .findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            isShiftActive: false,
            assignedBeds: [],
            status: 'archived',
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

    if (deletedNurse === null) {
      throw new NotFoundException(
        'Nurse not found',
      );
    }

    return {
      message: 'Nurse archived successfully',
      nurseId: deletedNurse._id,
      fullName: deletedNurse.fullName,
    };
  }

  private rejectNullValues(value: object): void {
    const nullField = Object.entries(value).find(
      ([, fieldValue]) => fieldValue === null,
    )?.[0];

    if (nullField !== undefined) {
      throw new BadRequestException(
        `${nullField} cannot be null`,
      );
    }
  }

  private escapeRegExp(value: string): string {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
  }

  private handleDuplicateKeyError(
    error: unknown,
  ): void {
    if (!this.isDuplicateKeyError(error)) {
      return;
    }

    const duplicateField =
      Object.keys(error.keyPattern ?? {})[0] ??
      'unique field';

    throw new ConflictException(
      `A nurse with this ${duplicateField} already exists`,
    );
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