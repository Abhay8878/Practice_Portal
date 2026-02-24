import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import {
  RegistrationService,
  CreateRegistrationDto,
} from '../services/registration.service';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createDto: CreateRegistrationDto) {
    const registration = await this.registrationService.create(createDto);
    return registration;
  }
}
