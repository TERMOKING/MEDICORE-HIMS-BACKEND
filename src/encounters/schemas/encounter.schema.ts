import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

import {
  ENCOUNTER_STATUSES,
  ENCOUNTER_TYPES,
  type EncounterStatus,
  type EncounterType,
} from '../constants/encounter.constants.js';

import {
  EncounterStatusHistory,
  EncounterStatusHistorySchema,
} from './encounter-status-history.schema.js';

export type EncounterDocument =
  HydratedDocument<Encounter>;

@Schema({
  timestamps: true,
  optimisticConcurrency: true,
})
export class Encounter {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  encounterNumber!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true,
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
    type: String,
    trim: true,
  })
  departmentId?: string;

  @Prop({
    type: String,
    trim: true,
  })
  hospitalId?: string;

  @Prop({
    type: String,
    trim: true,
  })
  branchId?: string;

  @Prop({
    type: String,
    enum: ENCOUNTER_TYPES,
    required: true,
    default: 'outpatient',
  })
  encounterType!: EncounterType;

  @Prop({
    type: String,
    enum: ENCOUNTER_STATUSES,
    required: true,
    default: 'in_progress',
    index: true,
  })
  status!: EncounterStatus;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 1000,
  })
  chiefComplaint!: string;

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  startedAt!: Date;

  @Prop({
    type: Date,
  })
  completedAt?: Date;

  @Prop({
    type: Date,
  })
  signedAt?: Date;

  @Prop({
    type: Date,
  })
  cancelledAt?: Date;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isLocked!: boolean;

  @Prop({
    type: [EncounterStatusHistorySchema],
    default: [],
  })
  statusHistory!: EncounterStatusHistory[];
}

export const EncounterSchema =
  SchemaFactory.createForClass(Encounter);

EncounterSchema.index({
  patientId: 1,
  startedAt: -1,
});

EncounterSchema.index({
  doctorId: 1,
  startedAt: -1,
});

EncounterSchema.index({
  status: 1,
  startedAt: -1,
});