import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { DoctorLoginDto } from './dto/doctor-login.dto.js';
import { Public } from './decorators/public.decorator.js';

@Controller('auth/doctor')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: DoctorLoginDto) {
    return this.authService.doctorLogin(
      loginDto,
    );
  }
}