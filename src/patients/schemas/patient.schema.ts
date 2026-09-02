import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  EmergencyContact,
  EmergencyContactSchema,
  PatientAddress,
  PatientAddressSchema,
} from './patient-contact.schema.js';

export type PatientDocument = HydratedDocument<Patient>;

@Schema({
  collection: 'patients',
  timestamps: true,
  versionKey: false,
})
export class Patient {

  @Prop({
    required: true,
    unique: true,
    immutable: true,
    index: true,
  })
  uhid!: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 120,
  })
  fullName!: string;

  @Prop({
    trim: true,
    maxlength: 120,
  })
  preferredName?: string;

  @Prop({
    required: true,
  })
  dateOfBirth!: Date;

  @Prop({
    required: true,
    enum: ['male', 'female', 'other', 'unknown'],
  })
  gender!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 30,
  })
  phone!: string;

  @Prop({
    trim: true,
    maxlength: 30,
  })
  alternatePhone?: string;

  @Prop({
    trim: true,
    lowercase: true,
    maxlength: 254,
  })
  email?: string;

  @Prop({
    type: PatientAddressSchema,
    required: true,
  })
  address!: PatientAddress;

  @Prop({
    type: EmergencyContactSchema,
    required: true,
  })
  emergencyContact!: EmergencyContact;

  @Prop({
  required: true,
  enum: [
    'opd',
    'admitted',
    'emergency',
    'observation',
    'discharged',
  ],
  default: 'opd',
  index: true,
})
status!: string;

@Prop({
  required: true,
  default: Date.now,
  immutable: true,
})
registeredAt!: Date;

@Prop({
  required: true,
  default: Date.now,
})
lastVisitAt!: Date;

  @Prop({
    enum: [
      'single',
      'married',
      'widowed',
      'divorced',
      'other',
    ],
  })
  maritalStatus?: string;

  @Prop({
    trim: true,
    maxlength: 120,
  })
  occupation?: string;

  @Prop({
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
  })
  bloodGroup!: string;

  @Prop({
    type: [String],
    default: [],
  })
  allergies!: string[];

  @Prop({
    trim: true,
    maxlength: 1000,
  })
  notes?: string;

  @Prop({
    default: false,
    index: true,
  })
  isDeleted!: boolean;

  @Prop()
  deletedAt?: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

PatientSchema.index({
  fullName: 1,
  isDeleted: 1,
});

PatientSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    const publicPatient = {
      ...returnedObject,
    };

    Reflect.deleteProperty(
      publicPatient,
      'isDeleted',
    );

    Reflect.deleteProperty(
      publicPatient,
      'deletedAt',
    );

    return publicPatient;
  },
});