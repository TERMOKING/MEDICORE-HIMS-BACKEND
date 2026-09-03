import { PartialType } from '@nestjs/mapped-types';

import { CreateNurseDto } from './create-nurse.dto.js';

export class UpdateNurseDto extends PartialType(CreateNurseDto) {}
