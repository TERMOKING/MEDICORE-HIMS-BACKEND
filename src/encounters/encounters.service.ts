import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Types, type Model } from 'mongoose';

import type { SaveEncounterDraftDto } from './dto/save-encounter-draft.dto.js';

import {
  Encounter,
  type EncounterDocument,
} from './schemas/encounter.schema.js';

@Injectable()
export class EncountersService {
  constructor(
    @InjectModel(Encounter.name)
    private readonly encounterModel: Model<EncounterDocument>,
  ) {}

  private toPlainObject(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object') {
      return {};
    }

    const possibleSubdocument = value as {
      toObject?: () => Record<string, unknown>;
    };

    if (typeof possibleSubdocument.toObject === 'function') {
      return possibleSubdocument.toObject();
    }

    return {
      ...(value as Record<string, unknown>),
    };
  }

  async findOne(id: string): Promise<EncounterDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid encounter ID');
    }

    const encounter = await this.encounterModel
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
      throw new NotFoundException('Encounter not found');
    }

    return encounter;
  }

  async saveDraft(
    id: string,
    dto: SaveEncounterDraftDto,
  ): Promise<EncounterDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid encounter ID');
    }

    const encounter = await this.encounterModel.findById(id).exec();

    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }

    if (encounter.isLocked || encounter.status === 'signed') {
      throw new ConflictException(
        'Signed or locked encounters cannot be modified',
      );
    }

    if (encounter.status !== 'in_progress') {
      throw new ConflictException(
        'Only an in-progress encounter can be edited',
      );
    }

    const scalarAndArrayFields: Array<keyof SaveEncounterDraftDto> = [
      'chiefComplaint',
      'historyOfPresentIllness',
      'pastMedicalHistory',
      'pastSurgicalHistory',
      'familyHistory',
      'socialHistory',
      'allergies',
      'currentMedications',
      'clinicalAssessment',
      'treatmentPlan',
      'doctorNotes',
      'referrals',
    ];

    for (const field of scalarAndArrayFields) {
      if (dto[field] !== undefined) {
        encounter.set(field, dto[field]);
      }
    }

    const savedAt = new Date();

    if (dto.vitals !== undefined) {
      const existingVitals = this.toPlainObject(encounter.get('vitals'));

      const mergedVitals: Record<string, unknown> = {
        ...existingVitals,
        ...dto.vitals,
        recordedAt: savedAt,
      };

      const weightKg = mergedVitals.weightKg;
      const heightCm = mergedVitals.heightCm;

      if (
        typeof weightKg === 'number' &&
        typeof heightCm === 'number' &&
        heightCm > 0
      ) {
        const heightMetres = heightCm / 100;

        mergedVitals.bmi = Number(
          (weightKg / (heightMetres * heightMetres)).toFixed(2),
        );
      }

      encounter.set('vitals', mergedVitals);
    }

    if (dto.examination !== undefined) {
      const existingExamination = this.toPlainObject(
        encounter.get('examination'),
      );

      const mergedExamination: Record<string, unknown> = {
        ...existingExamination,
        ...dto.examination,
      };

      if (dto.examination.general !== undefined) {
        mergedExamination.general = {
          ...this.toPlainObject(existingExamination.general),
          ...dto.examination.general,
        };
      }

      encounter.set('examination', mergedExamination);
    }

    if (dto.followUp !== undefined) {
      const existingFollowUp = this.toPlainObject(encounter.get('followUp'));

      encounter.set('followUp', {
        ...existingFollowUp,
        ...dto.followUp,
      });
    }

    encounter.lastSavedAt = savedAt;

    await encounter.save();

    return this.findOne(id);
  }
}
