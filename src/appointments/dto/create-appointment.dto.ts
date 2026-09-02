import {
  IsIn,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

import {
  APPOINTMENT_PRIORITIES,
  APPOINTMENT_SOURCES,
  APPOINTMENT_TYPES,
  CONSULTATION_MODES,
  type AppointmentPriority,
  type AppointmentSource,
  type AppointmentType,
  type ConsultationMode,
} from '../constants/appointment.constants.js';

export class CreateAppointmentDto {
  @IsMongoId()
  patientId!: string;

  @IsMongoId()
  doctorId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  departmentId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  hospitalId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  branchId?: string;

  @IsISO8601(
    { strict: true },
    {
      message:
        'startAt must be a valid ISO 8601 date and time',
    },
  )
  startAt!: string;

  @IsISO8601(
    { strict: true },
    {
      message:
        'endAt must be a valid ISO 8601 date and time',
    },
  )
  endAt!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  timezone?: string;

  @IsIn(APPOINTMENT_TYPES)
  appointmentType!: AppointmentType;

  @IsOptional()
  @IsIn(CONSULTATION_MODES)
  consultationMode?: ConsultationMode;

  @IsString()
  @IsNotEmpty()
  @Length(2, 1000)
  reasonForVisit!: string;

  @IsOptional()
  @IsIn(APPOINTMENT_PRIORITIES)
  priority?: AppointmentPriority;

  @IsOptional()
  @IsIn(APPOINTMENT_SOURCES)
  source?: AppointmentSource;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}