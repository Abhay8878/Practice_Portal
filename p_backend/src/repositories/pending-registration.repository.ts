import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingRegistration } from '../entities/pending-registration.entity';

@Injectable()
export class PendingRegistrationRepository {
    constructor(
        @InjectRepository(PendingRegistration)
        private readonly repo: Repository<PendingRegistration>,
    ) { }

    /** Find a pending registration by email */
    async findByEmail(email: string): Promise<PendingRegistration | null> {
        return this.repo.findOne({ where: { email } });
    }

    /** Create a PendingRegistration entity (does NOT persist) */
    createRegistration(data: Partial<PendingRegistration>): PendingRegistration {
        return this.repo.create(data);
    }

    /** Persist a PendingRegistration entity */
    async saveRegistration(
        registration: PendingRegistration,
    ): Promise<PendingRegistration> {
        return this.repo.save(registration);
    }
}
