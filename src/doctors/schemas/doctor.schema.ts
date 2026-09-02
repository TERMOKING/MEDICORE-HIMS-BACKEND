import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

import {
  DOCTOR_AVAILABLE_DAYS,
  type DoctorAvailableDay,
} from '../doctor.constants.js';

export type DoctorDocument = HydratedDocument<Doctor>;

@Schema({
  collection: 'doctors',
  timestamps: true,
  versionKey: false,
})
export class Doctor {
  @Prop({
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    index: true,
  })
  userId?: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  })
  fullName!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
    index: true,
    maxlength: 100,
  })
  medicalRegistrationNumber!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  })
  qualification!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true,
  })
  specialization!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
  })
  departmentId!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  })
  departmentName!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  })
  opdRoomNumber!: string;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  consultationFee!: number;

  @Prop({
    type: [String],
    required: true,
    enum: [...DOCTOR_AVAILABLE_DAYS],
  })
  availableDays!: DoctorAvailableDay[];

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  })
  opdTimings!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  })
  phone!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
    maxlength: 254,
  })
  email!: string;

  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  isAvailableToday!: boolean;

  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  isDeleted!: boolean;

  @Prop({
    type: Date,
  })
  deletedAt?: Date;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.index({
  departmentId: 1,
  isAvailableToday: 1,
  isDeleted: 1,
});

DoctorSchema.index({
  fullName: 1,
  isDeleted: 1,
});

DoctorSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    const publicDoctor = { ...returnedObject };

    Reflect.deleteProperty(publicDoctor, 'isDeleted');
    Reflect.deleteProperty(publicDoctor, 'deletedAt');

    return publicDoctor;
  },
});