import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

import {
  NURSE_SHIFTS,
  NURSE_STATUSES,
  type NurseShift,
  type NurseStatus,
} from '../nurse.constants.js';

export type NurseDocument = HydratedDocument<Nurse>;

@Schema({
  collection: 'nurses',
  timestamps: true,
  versionKey: false,
})
export class Nurse {
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
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
    index: true,
    maxlength: 50,
  })
  employeeId?: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
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
    minlength: 3,
    maxlength: 50,
  })
  nursingRegistrationNumber!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 255,
  })
  qualification!: string;

  @Prop({
    type: String,
    trim: true,
    default: 'Staff Nurse',
    maxlength: 100,
  })
  designation!: string;

  @Prop({
    type: String,
    trim: true,
    index: true,
    maxlength: 100,
  })
  departmentId?: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 150,
  })
  departmentName?: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
    maxlength: 100,
  })
  wardId!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 150,
  })
  wardName!: string;

  @Prop({
    type: String,
    required: true,
    enum: [...NURSE_SHIFTS],
    default: 'morning',
    index: true,
  })
  shift!: NurseShift;

  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
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
  isShiftActive!: boolean;

  @Prop({
    type: [String],
    default: [],
  })
  assignedBeds!: string[];

  @Prop({
    type: String,
    enum: [...NURSE_STATUSES],
    default: 'active',
    index: true,
  })
  status!: NurseStatus;

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

export const NurseSchema =
  SchemaFactory.createForClass(Nurse);

NurseSchema.index({
  wardId: 1,
  shift: 1,
  isShiftActive: 1,
  isDeleted: 1,
});

NurseSchema.index({
  departmentId: 1,
  status: 1,
  isDeleted: 1,
});

NurseSchema.index({
  fullName: 1,
  isDeleted: 1,
});

NurseSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    const publicNurse = { ...returnedObject };

    Reflect.deleteProperty(publicNurse, 'isDeleted');
    Reflect.deleteProperty(publicNurse, 'deletedAt');

    return publicNurse;
  },
});