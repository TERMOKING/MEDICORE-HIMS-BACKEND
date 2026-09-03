import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types, type HydratedDocument } from 'mongoose';

import { DIAGNOSIS_STATUSES, DIAGNOSIS_TYPES } from '../diagnosis.constants.js';

import type { DiagnosisStatus, DiagnosisType } from '../diagnosis.constants.js';

export type EncounterDiagnosisDocument = HydratedDocument<EncounterDiagnosis>;

@Schema({
  collection: 'encounter_diagnoses',
  timestamps: true,
})
export class EncounterDiagnosis {
  @Prop({
    type: Types.ObjectId,
    ref: 'Encounter',
    required: true,
    index: true,
  })
  encounterId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true,
  })
  appointmentId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  })
  patientId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true,
  })
  doctorId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 12,
    match: /^[A-Z][0-9][0-9A-Z](?:\.[0-9A-Z]{1,4})?$/,
  })
  icd10Code!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 500,
  })
  diagnosisName!: string;

  @Prop({
    required: true,
    enum: DIAGNOSIS_TYPES,
  })
  type!: DiagnosisType;

  @Prop({
    required: true,
    type: Boolean,
  })
  isPrimary!: boolean;

  @Prop({
    required: true,
    enum: DIAGNOSIS_STATUSES,
  })
  status!: DiagnosisStatus;

  @Prop({
    required: true,
    type: Date,
    default: Date.now,
  })
  diagnosedAt!: Date;

  @Prop({
    trim: true,
    maxlength: 5000,
  })
  notes?: string;

  @Prop({
    type: Date,
  })
  enteredInErrorAt?: Date;

  @Prop({
    trim: true,
    maxlength: 2000,
  })
  enteredInErrorReason?: string;
}

export const EncounterDiagnosisSchema =
  SchemaFactory.createForClass(EncounterDiagnosis);

EncounterDiagnosisSchema.index(
  {
    encounterId: 1,
    icd10Code: 1,
  },
  {
    unique: true,
  },
);

EncounterDiagnosisSchema.index(
  {
    encounterId: 1,
    isPrimary: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isPrimary: true,
    },
  },
);

EncounterDiagnosisSchema.index({
  patientId: 1,
  diagnosedAt: -1,
});
