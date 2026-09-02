import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { EncountersService } from './encounters.service.js';

@Controller('encounters')
export class EncountersController {
  constructor(
    private readonly encountersService:
      EncountersService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encountersService.findOne(id);
  }
}
