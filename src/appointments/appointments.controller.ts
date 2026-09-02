import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
} from '@nestjs/common';

import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto.js';

@Controller('appointments')
export class AppointmentsController {
    constructor(
        private readonly appointmentsService: AppointmentsService,
    ) { }

    @Post()
    create(
        @Body() createAppointmentDto: CreateAppointmentDto,
    ) {
        return this.appointmentsService.create(
            createAppointmentDto,
        );
    }

    @Get()
    findAll(
        @Query() query: ListAppointmentsQueryDto,
    ) {
        return this.appointmentsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.appointmentsService.findOne(id);
    }

    @Post(':id/arrive')
    markArrived(@Param('id') id: string) {
        return this.appointmentsService.markArrived(id);
    }

    @Post(':id/check-in')
    checkIn(@Param('id') id: string) {
        return this.appointmentsService.checkIn(id);
    }

    @Post(':id/start-encounter')
    startEncounter(@Param('id') id: string) {
        return this.appointmentsService.startEncounter(
            id,
        );
    }
}