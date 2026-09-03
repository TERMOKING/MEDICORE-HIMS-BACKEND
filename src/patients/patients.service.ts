import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { ListPatientsQueryDto } from './dto/list-patients-query.dto.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { Patient, PatientDocument } from './schemas/patient.schema.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  private generateUhid(): string {
    const year = new Date().getFullYear();

    const sequence = randomInt(0, 1_000_000).toString().padStart(6, '0');

    return `MCH-${year}-${sequence}`;
  }

  async create(createPatientDto: CreatePatientDto): Promise<PatientDocument> {
    const dateOfBirth = new Date(createPatientDto.dob);
    const now = new Date();

    if (dateOfBirth > now) {
      throw new BadRequestException('Date of birth cannot be in the future');
    }

    const earliestAllowedDate = new Date();
    earliestAllowedDate.setFullYear(now.getFullYear() - 150);

    if (dateOfBirth < earliestAllowedDate) {
      throw new BadRequestException(
        'Date of birth is outside the supported range',
      );
    }

    const uhid = this.generateUhid();

    const patient = new this.patientModel({
      uhid,
      fullName: createPatientDto.fullName.trim().replace(/\s+/g, ' '),

      preferredName: createPatientDto.preferredName?.trim(),

      dateOfBirth,
      gender: createPatientDto.gender,
      bloodGroup: createPatientDto.bloodGroup,
      phone: createPatientDto.phone.trim(),

      alternatePhone: createPatientDto.alternatePhone?.trim(),

      email: createPatientDto.email?.trim().toLowerCase(),

      address: {
        line1: createPatientDto.address.line1.trim(),
        line2: createPatientDto.address.line2?.trim(),
        city: createPatientDto.address.city.trim(),
        district: createPatientDto.address.district.trim(),
        state: createPatientDto.address.state.trim(),
        pincode: createPatientDto.address.pincode.trim(),
        country: createPatientDto.address.country.trim(),
      },

      emergencyContact: {
        name: createPatientDto.emergencyContact.name.trim(),
        relationship: createPatientDto.emergencyContact.relationship.trim(),
        phone: createPatientDto.emergencyContact.phone.trim(),
        alternatePhone:
          createPatientDto.emergencyContact.alternatePhone?.trim(),
      },

      maritalStatus: createPatientDto.maritalStatus,
      occupation: createPatientDto.occupation?.trim(),

      allergies:
        createPatientDto.allergies
          ?.map((allergy) => allergy.trim())
          .filter(Boolean) ?? [],

      notes: createPatientDto.notes?.trim(),
    });

    return patient.save();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid patient ID');
    }

    const patient = await this.patientModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .select('-isDeleted -deletedAt')
      .lean()
      .exec();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
  async findAll(query: ListPatientsQueryDto) {
    const { page, limit, search } = query;

    const filter: {
      isDeleted: boolean;
      fullName?: {
        $regex: string;
        $options: 'i';
      };
    } = {
      isDeleted: false,
    };

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      const escapedSearch = normalizedSearch.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );

      filter.fullName = {
        $regex: escapedSearch,
        $options: 'i',
      };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.patientModel
        .find(filter)
        .select('-isDeleted -deletedAt')
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.patientModel.countDocuments(filter).exec(),
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

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid patient ID');
    }

    if (Object.keys(updatePatientDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const updateData: Partial<Patient> = {};

    if (updatePatientDto.fullName !== undefined) {
      updateData.fullName = updatePatientDto.fullName
        .trim()
        .replace(/\s+/g, ' ');
    }

    if (updatePatientDto.preferredName !== undefined) {
      updateData.preferredName = updatePatientDto.preferredName.trim();
    }

    if (updatePatientDto.dob !== undefined) {
      const dateOfBirth = new Date(updatePatientDto.dob);

      const now = new Date();

      if (dateOfBirth > now) {
        throw new BadRequestException('Date of birth cannot be in the future');
      }

      const earliestAllowedDate = new Date();
      earliestAllowedDate.setFullYear(now.getFullYear() - 150);

      if (dateOfBirth < earliestAllowedDate) {
        throw new BadRequestException(
          'Date of birth is outside the supported range',
        );
      }

      updateData.dateOfBirth = dateOfBirth;
    }

    if (updatePatientDto.gender !== undefined) {
      updateData.gender = updatePatientDto.gender;
    }

    if (updatePatientDto.bloodGroup !== undefined) {
      updateData.bloodGroup = updatePatientDto.bloodGroup;
    }

    if (updatePatientDto.phone !== undefined) {
      updateData.phone = updatePatientDto.phone.trim();
    }

    if (updatePatientDto.alternatePhone !== undefined) {
      updateData.alternatePhone = updatePatientDto.alternatePhone.trim();
    }

    if (updatePatientDto.email !== undefined) {
      updateData.email = updatePatientDto.email.trim().toLowerCase();
    }

    if (updatePatientDto.address !== undefined) {
      updateData.address = {
        line1: updatePatientDto.address.line1.trim(),
        line2: updatePatientDto.address.line2?.trim(),
        city: updatePatientDto.address.city.trim(),
        district: updatePatientDto.address.district.trim(),
        state: updatePatientDto.address.state.trim(),
        pincode: updatePatientDto.address.pincode.trim(),
        country: updatePatientDto.address.country.trim(),
      };
    }

    if (updatePatientDto.emergencyContact !== undefined) {
      updateData.emergencyContact = {
        name: updatePatientDto.emergencyContact.name.trim(),
        relationship: updatePatientDto.emergencyContact.relationship.trim(),
        phone: updatePatientDto.emergencyContact.phone.trim(),
        alternatePhone:
          updatePatientDto.emergencyContact.alternatePhone?.trim(),
      };
    }

    if (updatePatientDto.maritalStatus !== undefined) {
      updateData.maritalStatus = updatePatientDto.maritalStatus;
    }

    if (updatePatientDto.occupation !== undefined) {
      updateData.occupation = updatePatientDto.occupation.trim();
    }

    if (updatePatientDto.allergies !== undefined) {
      updateData.allergies = updatePatientDto.allergies
        .map((allergy) => allergy.trim())
        .filter(Boolean);
    }

    if (updatePatientDto.notes !== undefined) {
      updateData.notes = updatePatientDto.notes.trim();
    }

    const patient = await this.patientModel
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

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid patient ID');
    }

    const deletedPatient = await this.patientModel
      .findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        },
        {
          new: true,
        },
      )
      .select('_id')
      .lean()
      .exec();

    if (!deletedPatient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      message: 'Patient deleted successfully',
    };
  }
}
