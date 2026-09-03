import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';

import { CreateEncounterDiagnosisDto } from './dto/create-encounter-diagnosis.dto.js';
import { UpdateEncounterDiagnosisDto } from './dto/update-encounter-diagnosis.dto.js';
import { DiagnosesService } from './diagnoses.service.js';
import {
  EnterDiagnosisInErrorDto,
} from './dto/enter-diagnosis-in-error.dto.js';

@Controller('encounters/:encounterId/diagnoses')
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  @Post()
  create(
    @Param('encounterId')
    encounterId: string,
    @Body()
    dto: CreateEncounterDiagnosisDto,
  ) {
    return this.diagnosesService.create(encounterId, dto);
  }

  @Get()
  findAll(
    @Param('encounterId')
    encounterId: string,
  ) {
    return this.diagnosesService.findAll(encounterId);
  }

  @Get(':diagnosisId')
  findOne(
    @Param('encounterId')
    encounterId: string,
    @Param('diagnosisId')
    diagnosisId: string,
  ) {
    return this.diagnosesService.findOne(encounterId, diagnosisId);
  }
  @Patch(':diagnosisId')
  update(
    @Param('encounterId')
    encounterId: string,
    @Param('diagnosisId')
    diagnosisId: string,
    @Body()
    dto: UpdateEncounterDiagnosisDto,
  ) {
    return this.diagnosesService.update(encounterId, diagnosisId, dto);
  }
    @Patch(':diagnosisId/entered-in-error')
  enterInError(
    @Param('encounterId')
    encounterId: string,
    @Param('diagnosisId')
    diagnosisId: string,
    @Body()
    dto: EnterDiagnosisInErrorDto,
  ) {
    return this.diagnosesService.enterInError(
      encounterId,
      diagnosisId,
      dto,
    );
  }
}
