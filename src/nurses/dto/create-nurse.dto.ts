import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  NURSE_EDITABLE_STATUSES,
  NURSE_SHIFTS,
  type NurseEditableStatus,
  type NurseShift,
} from '../nurse.constants.js';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalString(value: unknown): unknown {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? undefined : trimmedValue;
}

function uppercaseString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreateNurseDto {
  @IsOptional()
  @Transform(({ value }) => trimOptionalString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const transformedValue = trimOptionalString(value);

    return typeof transformedValue === 'string'
      ? transformedValue.toUpperCase()
      : transformedValue;
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Z0-9./-]+$/, {
    message: 'employeeId contains invalid characters',
  })
  employeeId?: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @Transform(({ value }) => uppercaseString(value))
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Z0-9./-]+$/, {
    message: 'nursingRegistrationNumber contains invalid characters',
  })
  nursingRegistrationNumber!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  qualification!: string;

  @IsOptional()
  @Transform(({ value }) => trimOptionalString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  designation?: string;

  @IsOptional()
  @Transform(({ value }) => trimOptionalString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  departmentId?: string;

  @IsOptional()
  @Transform(({ value }) => trimOptionalString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  departmentName?: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  wardId!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  wardName!: string;

  @IsIn([...NURSE_SHIFTS])
  shift!: NurseShift;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[0-9][0-9\s-]{6,19}$/, {
    message: 'phone must be a valid phone number',
  })
  phone!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsBoolean()
  isShiftActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.map((bed) =>
      typeof bed === 'string' ? bed.trim().toUpperCase() : bed,
    );
  })
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(50, { each: true })
  assignedBeds?: string[];

  @IsOptional()
  @IsIn([...NURSE_EDITABLE_STATUSES])
  status?: NurseEditableStatus;
}
