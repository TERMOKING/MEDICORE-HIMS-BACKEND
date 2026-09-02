import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from '../constants/appointment.constants.js';

@Schema({ _id: false })
export class AppointmentStatusHistory {
  @Prop({
    type: String,
    enum: APPOINTMENT_STATUSES,
  })
  fromStatus?: AppointmentStatus;

  @Prop({
    type: String,
    enum: APPOINTMENT_STATUSES,
    required: true,
  })
  toStatus!: AppointmentStatus;

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  changedAt!: Date;

  @Prop({
    type: String,
    trim: true,
    maxlength: 500,
  })
  reason?: string;

  @Prop({
    type: String,
    trim: true,
  })
  changedById?: string;
}

export const AppointmentStatusHistorySchema =
  SchemaFactory.createForClass(AppointmentStatusHistory);