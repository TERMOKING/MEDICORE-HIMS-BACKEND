import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class VitalSignsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(40)
  @Max(300)
  bloodPressureSys?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(200)
  bloodPressureDia?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(300)
  heartRateBpm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  @Max(100)
  respiratoryRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  spO2Percentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(80)
  @Max(115)
  temperatureFahrenheit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(300)
  heightCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1500)
  bloodSugarMgDl?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}