import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import {
  RegistrationStatus,
  RegistrationAddress,
} from '../entities/pending-registration.entity';

import { PendingRegistrationRepository } from '../repositories/pending-registration.repository';

export interface CreateRegistrationDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization?: string;
  practitionerType?: string;
  addresses: RegistrationAddress[];
}

@Injectable()
export class RegistrationService {
  constructor(
    private readonly registrationRepo: PendingRegistrationRepository,
  ) {}

  async create(dto: CreateRegistrationDto) {
    try {
      const normalizedEmail = dto.email?.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new BadRequestException('Email is required');
      }

      // Trim name fields
      const firstName = dto.firstName?.trim();
      const middleName = dto.middleName?.trim();
      const lastName = dto.lastName?.trim();

      if (!firstName || !lastName) {
        throw new BadRequestException('First name and last name are required');
      }

      // Optional: Check if email already exists
      const existing = await this.registrationRepo.findByEmail(normalizedEmail);

      if (existing) {
        throw new ConflictException('Email already registered');
      }

      const registration = this.registrationRepo.createRegistration({
        firstName,
        middleName,
        lastName,
        email: normalizedEmail,
        phoneNumber: dto.phoneNumber?.trim(),
        specialization: dto.specialization?.trim(),
        practitionerType: dto.practitionerType?.trim(),
        addresses: dto.addresses,
        status: RegistrationStatus.PENDING,
      });

      return await this.registrationRepo.saveRegistration(registration);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create registration');
    }
  }
}
