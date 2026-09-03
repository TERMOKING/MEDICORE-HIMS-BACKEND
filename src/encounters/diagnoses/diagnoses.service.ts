import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Types, type Model } from 'mongoose';

import type { CreateEncounterDiagnosisDto } from './dto/create-encounter-diagnosis.dto.js';
import type { EnterDiagnosisInErrorDto } from './dto/enter-diagnosis-in-error.dto.js';
import {
  Encounter,
  type EncounterDocument,
} from '../schemas/encounter.schema.js';
import type { UpdateEncounterDiagnosisDto } from './dto/update-encounter-diagnosis.dto.js';
import {
  EncounterDiagnosis,
  type EncounterDiagnosisDocument,
} from './schemas/encounter-diagnosis.schema.js';

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectModel(EncounterDiagnosis.name)
    private readonly diagnosisModel: Model<EncounterDiagnosisDocument>,

    @InjectModel(Encounter.name)
    private readonly encounterModel: Model<EncounterDocument>,
  ) {}

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private resolveDiagnosisIntegrity(
    icd10Code: string,
    diagnosisName: string,
  ): {
    icd10Code: string;
    diagnosisName: string;
  } {
    const normalizedCode = icd10Code.trim().toUpperCase();

    const normalizedName = diagnosisName.trim();

    const canonicalLabels: Record<string, string> = {
      I10: 'Essential (primary) hypertension',
    };

    return {
      icd10Code: normalizedCode,
      diagnosisName: canonicalLabels[normalizedCode] ?? normalizedName,
    };
  }

  async create(
    encounterId: string,
    dto: CreateEncounterDiagnosisDto,
  ): Promise<EncounterDiagnosisDocument> {
    if (!Types.ObjectId.isValid(encounterId)) {
      throw new BadRequestException('Invalid encounter ID');
    }

    const encounter = await this.encounterModel.findById(encounterId).exec();

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
        'Diagnoses can only be added to an in-progress encounter',
      );
    }

    const resolvedDiagnosis = this.resolveDiagnosisIntegrity(
      dto.icd10Code,
      dto.diagnosisName,
    );

    const duplicateDiagnosis = await this.diagnosisModel.exists({
      encounterId: encounter._id,
      icd10Code: resolvedDiagnosis.icd10Code,
    });

    if (duplicateDiagnosis) {
      throw new ConflictException(
        'This ICD-10 diagnosis already exists in the encounter',
      );
    }

    if (dto.isPrimary) {
      const existingPrimary = await this.diagnosisModel.exists({
        encounterId: encounter._id,
        isPrimary: true,
      });

      if (existingPrimary) {
        throw new ConflictException(
          'This encounter already has a primary diagnosis',
        );
      }
    }

    try {
      return await this.diagnosisModel.create({
        encounterId: encounter._id,
        appointmentId: encounter.appointmentId,
        patientId: encounter.patientId,
        doctorId: encounter.doctorId,
        icd10Code: resolvedDiagnosis.icd10Code,
        diagnosisName: resolvedDiagnosis.diagnosisName,
        type: dto.type,
        isPrimary: dto.isPrimary,
        status: 'active',
        diagnosedAt: new Date(),
        notes: dto.notes,
      });
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Duplicate diagnosis or primary diagnosis conflict',
        );
      }

      throw error;
    }
  }

  async findAll(encounterId: string): Promise<EncounterDiagnosisDocument[]> {
    if (!Types.ObjectId.isValid(encounterId)) {
      throw new BadRequestException('Invalid encounter ID');
    }

    const encounterExists = await this.encounterModel.exists({
      _id: encounterId,
    });

    if (!encounterExists) {
      throw new NotFoundException('Encounter not found');
    }

    return this.diagnosisModel
      .find({
        encounterId: new Types.ObjectId(encounterId),
      })
      .sort({
        isPrimary: -1,
        diagnosedAt: 1,
      })
      .exec();
  }

  async findOne(
    encounterId: string,
    diagnosisId: string,
  ): Promise<EncounterDiagnosisDocument> {
    if (!Types.ObjectId.isValid(encounterId)) {
      throw new BadRequestException('Invalid encounter ID');
    }

    if (!Types.ObjectId.isValid(diagnosisId)) {
      throw new BadRequestException('Invalid diagnosis ID');
    }

    const diagnosis = await this.diagnosisModel
      .findOne({
        _id: diagnosisId,
        encounterId: new Types.ObjectId(encounterId),
      })
      .exec();

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found in this encounter');
    }

    return diagnosis;
  }

  async update(
    encounterId: string,
    diagnosisId: string,
    dto: UpdateEncounterDiagnosisDto,
  ): Promise<EncounterDiagnosisDocument> {
    if (!Types.ObjectId.isValid(encounterId)) {
      throw new BadRequestException('Invalid encounter ID');
    }

    if (!Types.ObjectId.isValid(diagnosisId)) {
      throw new BadRequestException('Invalid diagnosis ID');
    }

    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException(
        'At least one diagnosis field must be provided',
      );
    }

    const encounter = await this.encounterModel.findById(encounterId).exec();

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
        'Diagnoses can only be edited during an in-progress encounter',
      );
    }

    const diagnosis = await this.diagnosisModel
      .findOne({
        _id: diagnosisId,
        encounterId: new Types.ObjectId(encounterId),
      })
      .exec();

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found in this encounter');
    }
    if (diagnosis.status === 'entered_in_error') {
      throw new ConflictException(
        'A diagnosis entered in error cannot be edited',
      );
    }

    const requestedCode = dto.icd10Code ?? diagnosis.icd10Code;

    const requestedName = dto.diagnosisName ?? diagnosis.diagnosisName;

    const codeWasChanged =
      dto.icd10Code !== undefined &&
      dto.icd10Code.trim().toUpperCase() !== diagnosis.icd10Code;

    if (codeWasChanged && dto.diagnosisName === undefined) {
      throw new BadRequestException(
        'diagnosisName is required when changing icd10Code',
      );
    }

    const resolvedDiagnosis = this.resolveDiagnosisIntegrity(
      requestedCode,
      requestedName,
    );

    if (resolvedDiagnosis.icd10Code !== diagnosis.icd10Code) {
      const duplicateDiagnosis = await this.diagnosisModel.exists({
        _id: {
          $ne: diagnosis._id,
        },
        encounterId: encounter._id,
        icd10Code: resolvedDiagnosis.icd10Code,
      });

      if (duplicateDiagnosis) {
        throw new ConflictException(
          'This ICD-10 diagnosis already exists in the encounter',
        );
      }
    }

    if (dto.isPrimary === true && !diagnosis.isPrimary) {
      const existingPrimary = await this.diagnosisModel.exists({
        _id: {
          $ne: diagnosis._id,
        },
        encounterId: encounter._id,
        isPrimary: true,
      });

      if (existingPrimary) {
        throw new ConflictException(
          'This encounter already has a primary diagnosis',
        );
      }
    }

    diagnosis.icd10Code = resolvedDiagnosis.icd10Code;

    diagnosis.diagnosisName = resolvedDiagnosis.diagnosisName;

    if (dto.type !== undefined) {
      diagnosis.type = dto.type;
    }

    if (dto.isPrimary !== undefined) {
      diagnosis.isPrimary = dto.isPrimary;
    }

    if (dto.notes !== undefined) {
      diagnosis.notes = dto.notes;
    }

    try {
      return await diagnosis.save();
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Duplicate diagnosis or primary diagnosis conflict',
        );
      }

      throw error;
    }
  }
  async enterInError(
    encounterId: string,
    diagnosisId: string,
    dto: EnterDiagnosisInErrorDto,
  ): Promise<EncounterDiagnosisDocument> {
    if (!Types.ObjectId.isValid(encounterId)) {
      throw new BadRequestException('Invalid encounter ID');
    }

    if (!Types.ObjectId.isValid(diagnosisId)) {
      throw new BadRequestException('Invalid diagnosis ID');
    }

    const encounter = await this.encounterModel.findById(encounterId).exec();

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
        'Diagnoses can only be changed during an in-progress encounter',
      );
    }

    const diagnosis = await this.diagnosisModel
      .findOne({
        _id: diagnosisId,
        encounterId: new Types.ObjectId(encounterId),
      })
      .exec();

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found in this encounter');
    }

    if (diagnosis.status === 'entered_in_error') {
      throw new ConflictException(
        'Diagnosis is already marked as entered in error',
      );
    }

    diagnosis.status = 'entered_in_error';

    diagnosis.isPrimary = false;

    diagnosis.enteredInErrorAt = new Date();

    diagnosis.enteredInErrorReason = dto.reason;

    return diagnosis.save();
  }
}
