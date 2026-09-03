import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const REFERRAL_PRIORITIES = ['routine', 'urgent', 'stat'] as const;

export type ReferralPriority = (typeof REFERRAL_PRIORITIES)[number];

@Schema({
  _id: false,
})
export class ClinicalReferral {
  @Prop({
    trim: true,
    maxlength: 120,
  })
  specialty?: string;

  @Prop({
    trim: true,
    maxlength: 150,
  })
  doctorName?: string;

  @Prop({
    trim: true,
    maxlength: 2000,
  })
  reason?: string;

  @Prop({
    enum: REFERRAL_PRIORITIES,
  })
  priority?: ReferralPriority;
}

export const ClinicalReferralSchema =
  SchemaFactory.createForClass(ClinicalReferral);

@Schema({
  _id: false,
})
export class FollowUpPlan {
  @Prop({
    type: Boolean,
  })
  required?: boolean;

  @Prop({
    min: 1,
    max: 3650,
  })
  intervalDays?: number;

  @Prop({
    trim: true,
    maxlength: 100,
  })
  suggestedInterval?: string;

  @Prop({
    type: Date,
  })
  followUpDate?: Date;

  @Prop({
    trim: true,
    maxlength: 2000,
  })
  instructions?: string;
}

export const FollowUpPlanSchema = SchemaFactory.createForClass(FollowUpPlan);
