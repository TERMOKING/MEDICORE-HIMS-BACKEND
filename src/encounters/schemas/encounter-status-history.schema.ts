import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  ENCOUNTER_STATUSES,
  type EncounterStatus,
} from '../constants/encounter.constants.js';

@Schema({ _id: false })
export class EncounterStatusHistory {
  @Prop({
    type: String,
    enum: ENCOUNTER_STATUSES,
  })
  fromStatus?: EncounterStatus;

  @Prop({
    type: String,
    enum: ENCOUNTER_STATUSES,
    required: true,
  })
  toStatus!: EncounterStatus;

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

export const EncounterStatusHistorySchema =
  SchemaFactory.createForClass(
    EncounterStatusHistory,
  );