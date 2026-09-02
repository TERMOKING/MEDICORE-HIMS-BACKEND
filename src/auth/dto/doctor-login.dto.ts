import {
  IsMongoId,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class DoctorLoginDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(200)
  password!: string;
}