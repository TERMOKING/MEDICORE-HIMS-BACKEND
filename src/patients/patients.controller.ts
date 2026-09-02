import {
    Body,
    Controller,
    Post,
    Get,
    Param,
    Query,
    Delete,
} from '@nestjs/common';

import { CreatePatientDto, } from './dto/create-patient.dto.js';
import { ListPatientsQueryDto } from './dto/list-patients-query.dto.js';
import { PatientsService } from './patients.service.js';

@Controller('patients')
export class PatientsController {
    constructor(
        private readonly patientsService: PatientsService,
    ) { }

    @Post()
    create(
        @Body() createPatientDto: CreatePatientDto,
    ) {
        return this.patientsService.create(createPatientDto);
    }

    @Get()
    findAll(
        @Query() query: ListPatientsQueryDto,
    ) {
        return this.patientsService.findAll(query);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
    ) {
        return this.patientsService.findOne(id);
    }

    @Delete(':id')
    remove(
        @Param('id') id: string,
    ) {
        return this.patientsService.remove(id);
    }
}