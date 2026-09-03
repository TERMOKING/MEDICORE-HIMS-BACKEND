import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class GeneralPhysicalExam {
  @Prop({ type: Boolean })
  pallor?: boolean;

  @Prop({ type: Boolean })
  icterus?: boolean;

  @Prop({ type: Boolean })
  cyanosis?: boolean;

  @Prop({ type: Boolean })
  clubbing?: boolean;

  @Prop({ type: Boolean })
  lymphadenopathy?: boolean;

  @Prop({ type: Boolean })
  edema?: boolean;

  @Prop({
    type: String,
    trim: true,
    maxlength: 2000,
  })
  notes?: string;
}

export const GeneralPhysicalExamSchema =
  SchemaFactory.createForClass(GeneralPhysicalExam);

@Schema({ _id: false })
export class ClinicalExamination {
  @Prop({
    type: GeneralPhysicalExamSchema,
  })
  general?: GeneralPhysicalExam;

  @Prop({
    type: String,
    trim: true,
    maxlength: 4000,
  })
  cardiovascular?: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 4000,
  })
  respiratory?: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 4000,
  })
  abdomen?: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 4000,
  })
  neurological?: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 4000,
  })
  musculoskeletal?: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 4000,
  })
  skin?: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 4000,
  })
  otherFindings?: string;
}

export const ClinicalExaminationSchema =
  SchemaFactory.createForClass(ClinicalExamination);
