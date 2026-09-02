import {
  Transform,
  Type,
} from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  NURSE_EDITABLE_STATUSES,
  NURSE_SHIFTS,
  type NurseEditableStatus,
  type NurseShift,
} from '../nurse.constants.js';

export type NurseSortField =
  | 'fullName'
  | 'createdAt'
  | 'nursingRegistrationNumber'
  | 'wardName';

export type NurseSortOrder = 'asc' | 'desc';

function optionalQueryString(
  value: unknown,
): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue === ''
    ? undefined
    : trimmedValue;
}

function queryBoolean(value: unknown): unknown {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return value;
}

export class ListNursesQueryDto {
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
  @Transform(({ value }) =>
    optionalQueryString(value),
  )
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Transform(({ value }) =>
    optionalQueryString(value),
  )
  @IsString()
  @MaxLength(100)
  wardId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    optionalQueryString(value),
  )
  @IsString()
  @MaxLength(100)
  departmentId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    optionalQueryString(value),
  )
  @IsIn([...NURSE_SHIFTS])
  shift?: NurseShift;

  @IsOptional()
  @Transform(({ value }) => queryBoolean(value))
  @IsBoolean()
  isShiftActive?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    optionalQueryString(value),
  )
  @IsIn([...NURSE_EDITABLE_STATUSES])
  status?: NurseEditableStatus;

  @IsOptional()
  @IsIn([
    'fullName',
    'createdAt',
    'nursingRegistrationNumber',
    'wardName',
  ])
  sortBy: NurseSortField = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: NurseSortOrder = 'desc';
}