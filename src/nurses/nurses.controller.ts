import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateNurseDto } from './dto/create-nurse.dto.js';
import {
  ListNursesQueryDto,
} from './dto/list-nurses-query.dto.js';
import { UpdateNurseDto } from './dto/update-nurse.dto.js';
import { NursesService } from './nurses.service.js';

@Controller('nurses')
export class NursesController {
  constructor(
    private readonly nursesService: NursesService,
  ) {}

  @Post()
  create(@Body() createNurseDto: CreateNurseDto) {
    return this.nursesService.create(
      createNurseDto,
    );
  }

  @Get()
  findAll(
    @Query() query: ListNursesQueryDto,
  ) {
    return this.nursesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nursesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNurseDto: UpdateNurseDto,
  ) {
    return this.nursesService.update(
      id,
      updateNurseDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nursesService.remove(id);
  }
}