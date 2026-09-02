import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { InjectModel } from '@nestjs/mongoose';
import {
    isValidObjectId,
    Model,
} from 'mongoose';

import { ListPatientsQueryDto } from './dto/list-patients-query.dto.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import {
    Patient,
    PatientDocument,
} from './schemas/patient.schema.js';

@Injectable()
export class PatientsService {
    constructor(
        @InjectModel(Patient.name)
        private readonly patientModel: Model<PatientDocument>,
    ) { }

    private generateUhid(): string {
  const year = new Date().getFullYear();

  const sequence = randomInt(0, 1_000_000)
    .toString()
    .padStart(6, '0');

  return `MCH-${year}-${sequence}`;
}

    async create(
        createPatientDto: CreatePatientDto,
    ): Promise<PatientDocument> {
        const dateOfBirth = new Date(createPatientDto.dob);
        const now = new Date();

        if (dateOfBirth > now) {
            throw new BadRequestException(
                'Date of birth cannot be in the future',
            );
        }

        const earliestAllowedDate = new Date();
        earliestAllowedDate.setFullYear(
            now.getFullYear() - 150,
        );

        if (dateOfBirth < earliestAllowedDate) {
            throw new BadRequestException(
                'Date of birth is outside the supported range',
            );
        }

        const uhid = this.generateUhid();

        const patient = new this.patientModel({

            uhid,
            fullName: createPatientDto.fullName
                .trim()
                .replace(/\s+/g, ' '),

            preferredName:
                createPatientDto.preferredName?.trim(),

            dateOfBirth,
            gender: createPatientDto.gender,
            bloodGroup: createPatientDto.bloodGroup,
            phone: createPatientDto.phone.trim(),

            alternatePhone:
                createPatientDto.alternatePhone?.trim(),

            email:
                createPatientDto.email?.trim().toLowerCase(),

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
                name:
                    createPatientDto.emergencyContact.name.trim(),
                relationship:
                    createPatientDto.emergencyContact.relationship.trim(),
                phone:
                    createPatientDto.emergencyContact.phone.trim(),
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
        const {
            page,
            limit,
            search,
        } = query;

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

            this.patientModel
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