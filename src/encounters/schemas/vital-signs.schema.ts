import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class VitalSigns {
  @Prop({
    type: Date,
  })
  recordedAt?: Date;

  @Prop({
    type: Number,
    min: 20,
    max: 350,
  })
  bloodPressureSys?: number;

  @Prop({
    type: Number,
    min: 10,
    max: 250,
  })
  bloodPressureDia?: number;

  @Prop({
    type: Number,
    min: 10,
    max: 300,
  })
  heartRateBpm?: number;

  @Prop({
    type: Number,
    min: 1,
    max: 100,
  })
  respiratoryRate?: number;

  @Prop({
    type: Number,
    min: 0,
    max: 100,
  })
  spO2Percentage?: number;

  @Prop({
    type: Number,
    min: 80,
    max: 115,
  })
  temperatureFahrenheit?: number;

  @Prop({
    type: Number,
    min: 0.1,
    max: 500,
  })
  weightKg?: number;

  @Prop({
    type: Number,
    min: 20,
    max: 300,
  })
  heightCm?: number;

  @Prop({
    type: Number,
    min: 1,
    max: 150,
  })
  bmi?: number;

  @Prop({
    type: Number,
    min: 1,
    max: 2000,
  })
  bloodSugarMgDl?: number;

  @Prop({
    type: Boolean,
  })
  isCritical?: boolean;

  @Prop({
    type: String,
    trim: true,
    maxlength: 1000,
  })
  notes?: string;
}

export const VitalSignsSchema = SchemaFactory.createForClass(VitalSigns);
