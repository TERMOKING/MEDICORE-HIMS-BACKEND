import { Transform } from 'class-transformer';

import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class EnterDiagnosisInErrorDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  reason!: string;
}
