import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dtos/patients/create-patient.dto';
import { UpdatePatientDto } from '../dtos/patients/update-patient.dto';
import { PatientResponse } from '../types/patient-responses';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) { }

  /* ---------- CREATE PATIENT ---------- */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePatientDto,
  ): Promise<PatientResponse> {
    return this.patientsService.create(dto);
  }

  /* ---------- GET ALL PATIENTS ---------- */
  @Get()
  async findAll(
    @Query('tenantId') tenantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    if (page && limit) {
      return this.patientsService.findAllPaginated(
        parseInt(page),
        parseInt(limit),
        tenantId,
      );
    }
    return this.patientsService.findAll(tenantId);
  }

  /* ---------- GET PATIENT BY ID ---------- */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PatientResponse> {
    return this.patientsService.findOne(id);
  }

  /* ---------- UPDATE PATIENT ---------- */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<PatientResponse> {
    return this.patientsService.update(id, dto);
  }

  /* ---------- DELETE PATIENT ---------- */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<null> {
    await this.patientsService.remove(id);
    return null;
  }
}
