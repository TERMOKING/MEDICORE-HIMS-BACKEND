import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import {
  Types,
  type Model,
} from 'mongoose';

import {
  Encounter,
  type EncounterDocument,
} from './schemas/encounter.schema.js';

@Injectable()
export class EncountersService {
  constructor(
    @InjectModel(Encounter.name)
    private readonly encounterModel:
      Model<EncounterDocument>,
  ) {}

  async findOne(
    id: string,
  ): Promise<EncounterDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Invalid encounter ID',
      );
    }

    const encounter =
      await this.encounterModel
        .findById(id)
        .populate({
          path: 'patientId',
          select:
            'fullName preferredName uhid phone gender dateOfBirth bloodGroup allergies',
        })
        .populate({
          path: 'doctorId',
          select:
            'fullName qualification specialization departmentName opdRoomNumber',
        })
        .populate({
          path: 'appointmentId',
          select:
            'appointmentNumber startAt endAt timezone status arrivedAt checkedInAt actualWaitingMinutes reasonForVisit',
        })
        .exec();

    if (!encounter) {
      throw new NotFoundException(
        'Encounter not found',
      );
    }

    return encounter;
  }
}