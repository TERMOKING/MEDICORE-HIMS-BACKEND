import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import {
  APPOINTMENT_PRIORITIES,
  APPOINTMENT_SOURCES,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CONSULTATION_MODES,
  type AppointmentPriority,
  type AppointmentSource,
  type AppointmentStatus,
  type AppointmentType,
  type ConsultationMode,
} from '../constants/appointment.constants.js';

import {
  AppointmentStatusHistory,
  AppointmentStatusHistorySchema,
} from './appointment-status-history.schema.js';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({
  timestamps: true,
  optimisticConcurrency: true,
})
export class Appointment {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  appointmentNumber!: string;

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
    type: Date,
    required: true,
    index: true,
  })
  startAt!: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endAt!: Date;

  @Prop({
    type: String,
    required: true,
    trim: true,
    default: 'Asia/Kolkata',
  })
  timezone!: string;

  @Prop({
    type: String,
    enum: APPOINTMENT_TYPES,
    required: true,
  })
  appointmentType!: AppointmentType;

  @Prop({
    type: String,
    enum: CONSULTATION_MODES,
    required: true,
    default: 'in_person',
  })
  consultationMode!: ConsultationMode;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 1000,
  })
  reasonForVisit!: string;

  @Prop({
    type: String,
    enum: APPOINTMENT_PRIORITIES,
    required: true,
    default: 'routine',
  })
  priority!: AppointmentPriority;

  @Prop({
    type: String,
    enum: APPOINTMENT_SOURCES,
    required: true,
    default: 'staff',
  })
  source!: AppointmentSource;

  @Prop({
    type: String,
    enum: APPOINTMENT_STATUSES,
    required: true,
    default: 'booked',
    index: true,
  })
  status!: AppointmentStatus;

  @Prop({
    type: Number,
    min: 1,
  })
  tokenNumber?: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Encounter',
    default: null,
  })
  encounterId?: Types.ObjectId | null;

  @Prop({
    type: Date,
  })
  arrivedAt?: Date;

  @Prop({
    type: Date,
  })
  checkedInAt?: Date;

  @Prop({
    type: Date,
  })
  waitingStartedAt?: Date;

  @Prop({
    type: Date,
  })
  consultationStartedAt?: Date;

  @Prop({
    type: Date,
  })
  waitingEndedAt?: Date;

  @Prop({
    type: Number,
    min: 0,
  })
  actualWaitingMinutes?: number;

  @Prop({
    type: String,
    trim: true,
    maxlength: 500,
  })
  cancellationReason?: string;

  @Prop({
    type: Date,
  })
  cancelledAt?: Date;

  @Prop({
    type: Date,
  })
  noShowAt?: Date;

  @Prop({
    type: [AppointmentStatusHistorySchema],
    default: [],
  })
  statusHistory!: AppointmentStatusHistory[];

  @Prop({
    type: String,
    trim: true,
    maxlength: 2000,
  })
  notes?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({
  patientId: 1,
  startAt: -1,
});

AppointmentSchema.index({
  doctorId: 1,
  startAt: 1,
});

AppointmentSchema.index({
  status: 1,
  startAt: 1,
});
