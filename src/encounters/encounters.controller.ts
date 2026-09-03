import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';

import {
  SaveEncounterDraftDto,
} from './dto/save-encounter-draft.dto.js';

import {
  EncountersService,
} from './encounters.service.js';

@Controller('encounters')
export class EncountersController {
  constructor(
    private readonly encountersService:
      EncountersService,
  ) {}

  @Patch(':id/draft')
  saveDraft(
    @Param('id') id: string,
    @Body() dto: SaveEncounterDraftDto,
  ) {
    return this.encountersService.saveDraft(
      id,
      dto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encountersService.findOne(id);
  }
}