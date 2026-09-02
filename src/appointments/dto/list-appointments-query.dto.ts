import { Type } from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  APPOINTMENT_PRIORITIES,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  type AppointmentPriority,
  type AppointmentStatus,
  type AppointmentType,
} from '../constants/appointment.constants.js';

const APPOINTMENT_SORT_FIELDS = [
  'startAt',
  'createdAt',
  'appointmentNumber',
] as const;

const SORT_ORDERS = ['asc', 'desc'] as const;

export class ListAppointmentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsMongoId()
  patientId?: string;

  @IsOptional()
  @IsMongoId()
  doctorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departmentId?: string;

  @IsOptional()
  @IsIn(APPOINTMENT_STATUSES)
  status?: AppointmentStatus;

  @IsOptional()
  @IsIn(APPOINTMENT_TYPES)
  appointmentType?: AppointmentType;

  @IsOptional()
  @IsIn(APPOINTMENT_PRIORITIES)
  priority?: AppointmentPriority;

  @IsOptional()
  @IsISO8601({ strict: true })
  dateFrom?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  dateTo?: string;

  @IsOptional()
  @IsIn(APPOINTMENT_SORT_FIELDS)
  sortBy: (typeof APPOINTMENT_SORT_FIELDS)[number] =
    'startAt';

  @IsOptional()
  @IsIn(SORT_ORDERS)
  sortOrder: (typeof SORT_ORDERS)[number] = 'asc';
}