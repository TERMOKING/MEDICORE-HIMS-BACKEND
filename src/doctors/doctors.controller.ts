import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { DoctorsService } from './doctors.service.js';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
  ) {}

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }
}