import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class PatientAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  line1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  line2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;

  @IsString()
  @Matches(/^[1-9][0-9]{5}$/)
  pincode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;
}

export class EmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  relationship!: string;

  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,30}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,30}$/)
  alternatePhone?: string;
}