import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsDefined,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  EmergencyContactDto,
  PatientAddressDto,
} from './patient-contact.dto.js';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  preferredName?: string;

  @IsDateString()
  dob!: string;

  @IsIn(['male', 'female', 'other'])
  gender!: 'male' | 'female' | 'other';

  @IsIn([
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ])
  bloodGroup!: string;

  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,30}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,30}$/)
  alternatePhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => PatientAddressDto)
  address!: PatientAddressDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact!: EmergencyContactDto;

  @IsOptional()
  @IsIn([
    'single',
    'married',
    'widowed',
    'divorced',
    'other',
  ])
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  occupation?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}