import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientRepository {
    constructor(
        @InjectRepository(Patient)
        private readonly repo: Repository<Patient>,
    ) { }

    /** Create a Patient entity (does NOT persist) */
    createPatient(data: Partial<Patient>): Patient {
        return this.repo.create(data);
    }

    /** Persist a Patient entity */
    async savePatient(patient: Patient, manager?: EntityManager): Promise<Patient> {
        const repo = manager ? manager.getRepository(Patient) : this.repo;
        return repo.save(patient);
    }

    /** Find a patient by ID */
    async findById(id: string): Promise<Patient | null> {
        return this.repo.findOne({ where: { id } });
    }

    /** Find a patient by email */
    async findByEmail(email: string): Promise<Patient | null> {
        return this.repo.findOne({ where: { email } });
    }

    /** Find all patients with optional where clause and relations */
    async findAll(
        where: FindOptionsWhere<Patient> | Partial<Patient>,
        relations?: string[],
    ): Promise<Patient[]> {
        return this.repo.find({
            where,
            relations,
            order: { createdAt: 'DESC' },
        });
    }

    /** Paginated find with count */
    async findAndCount(
        where: FindOptionsWhere<Patient> | Partial<Patient>,
        options: { relations?: string[]; skip: number; take: number },
    ): Promise<[Patient[], number]> {
        return this.repo.findAndCount({
            where,
            relations: options.relations,
            order: { createdAt: 'DESC' },
            skip: options.skip,
            take: options.take,
        });
    }

    /** Remove a Patient entity */
    async removePatient(patient: Patient, manager?: EntityManager): Promise<Patient> {
        const repo = manager ? manager.getRepository(Patient) : this.repo;
        return repo.remove(patient);
    }
}
