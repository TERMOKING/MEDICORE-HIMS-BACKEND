import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class PatientAddress {
  @Prop({
    required: true,
    trim: true,
    maxlength: 150,
  })
  line1!: string;

  @Prop({
    trim: true,
    maxlength: 150,
  })
  line2?: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  city!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  district!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  state!: string;

  @Prop({
    required: true,
    match: /^[1-9][0-9]{5}$/,
  })
  pincode!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  country!: string;
}

export const PatientAddressSchema =
  SchemaFactory.createForClass(PatientAddress);

@Schema({
  _id: false,
})
export class EmergencyContact {
  @Prop({
    required: true,
    trim: true,
    maxlength: 120,
  })
  name!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 50,
  })
  relationship!: string;

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
}

export const EmergencyContactSchema =
  SchemaFactory.createForClass(EmergencyContact);
