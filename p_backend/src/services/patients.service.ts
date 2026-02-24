import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Address } from '../entities/address.entity';
import { CreatePatientDto } from '../dtos/patients/create-patient.dto';
import { UpdatePatientDto } from '../dtos/patients/update-patient.dto';
import { PatientResponse } from '../types/patient-responses';

import { PatientRepository } from '../repositories/patient.repository';
import { AddressRepository } from '../repositories/address.repository';

@Injectable()
export class PatientsService {
  constructor(
    private readonly patientRepo: PatientRepository,
    private readonly addressRepo: AddressRepository,
    private readonly dataSource: DataSource,
  ) {}

  // ================= PRIVATE MAPPER =================
  private mapPatientResponse(
    patient: Patient,
    addresses: Address[],
  ): PatientResponse {
    return {
      id: patient.id,
      firstName: patient.firstName,
      middleName: patient.middleName,
      lastName: patient.lastName,
      email: patient.email,
      contact: patient.contact,
      dob: patient.dob,
      gender: patient.gender,
      tenantId: patient.tenantId,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      addresses,
    };
  }

  // ================= CREATE =================
  async create(createPatientDto: CreatePatientDto): Promise<PatientResponse> {
    // Normalize email (lowercase + trim)
    const normalizedEmail = createPatientDto.email.trim().toLowerCase();

    // Check for existing patient with same email
    const existingPatient = await this.patientRepo.findByEmail(normalizedEmail);

    if (existingPatient) {
      throw new ConflictException(
        `Patient with email ${normalizedEmail} already exists`,
      );
    }

    const { address, tenantId, ...patientData } = createPatientDto;

    // ✅ Create patient in transaction
    const { savedPatient, addresses } = await this.dataSource.transaction(
      async (manager) => {
        const patient = this.patientRepo.createPatient({
          ...patientData,
          email: normalizedEmail, // always lowercase
          dob: new Date(createPatientDto.dob),
          tenantId: tenantId ?? null,
        });

        const saved = await this.patientRepo.savePatient(patient, manager);
        let addressList: Address[] = [];

        // ✅ Save address if provided
        if (address) {
          try {
            const addressEntity = this.addressRepo.createAddress({
              house_no: address.house_no ?? null,
              street: address.street ?? null,
              city: address.city,
              state: address.state,
              country: address.country,
              countryCode: address.countryCode ?? null,
              zipCode: address.zipCode,
              address_type: address.address_type ?? null,
              userId: saved.id,
              entityType: 'patient',
            });

            await this.addressRepo.saveAddress(addressEntity, manager);

            // ✅ Fetch addresses (within transaction if possible, or just push the new one)
            // Ideally we'd query within transaction, but addressRepo.findByUserIdAndEntityType doesn't support manager yet.
            // For now, we manually construct the list for the response or fetch after commit if needed.
            // Extending the repository to support find within txn is better, but for create flow, we know what we just added.
            addressList = [addressEntity];
          } catch (error) {
            console.error('ADDRESS SAVE FAILED:', error);
            throw error; // Re-throw to trigger rollback
          }
        }
        return { savedPatient: saved, addresses: addressList };
      },
    );

    // ✅ Final response
    return this.mapPatientResponse(savedPatient, addresses);
  }
  // ================= FIND ALL =================
  async findAll(tenantId?: string): Promise<PatientResponse[]> {
    const whereClause: Partial<Patient> = {};

    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const patients = await this.patientRepo.findAll(whereClause, ['addresses']);

    return patients.map((patient) => {
      const addresses = patient.addresses || [];
      return this.mapPatientResponse(patient, addresses);
    });
  }

  async findAllPaginated(page: number, limit: number, tenantId?: string) {
    const whereClause: Partial<Patient> = {};
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const [patients, total] = await this.patientRepo.findAndCount(whereClause, {
      relations: ['addresses'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = patients.map((patient) => {
      const addresses = patient.addresses || [];
      return this.mapPatientResponse(patient, addresses);
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ================= FIND ONE =================
  async findOne(id: string): Promise<PatientResponse> {
    const patient = await this.patientRepo.findById(id);

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    const addresses = await this.addressRepo.findByUserIdAndEntityType(
      patient.id,
      'patient',
    );

    return this.mapPatientResponse(patient, addresses);
  }

  // ================= UPDATE =================
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponse> {
    const patient = await this.patientRepo.findById(id);

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
      const existingPatient = await this.patientRepo.findByEmail(
        updatePatientDto.email,
      );

      if (existingPatient) {
        throw new ConflictException(
          `Patient with email ${updatePatientDto.email} already exists`,
        );
      }
    }

    const { dob, ...updateData } = updatePatientDto;

    if (dob) {
      patient.dob = new Date(dob);
    }

    Object.assign(patient, updateData);
    const updatedPatient = await this.patientRepo.savePatient(patient);

    const addresses = await this.addressRepo.findByUserIdAndEntityType(
      updatedPatient.id,
      'patient',
    );

    return this.mapPatientResponse(updatedPatient, addresses);
  }

  // ================= DELETE =================
  async remove(id: string): Promise<void> {
    const patient = await this.patientRepo.findById(id);

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    await this.addressRepo.deleteByUserIdAndEntityType(patient.id, 'patient');
    await this.patientRepo.removePatient(patient);
  }
}
