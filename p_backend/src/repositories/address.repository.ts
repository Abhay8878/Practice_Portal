import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Address } from '../entities/address.entity';

@Injectable()
export class AddressRepository {
    constructor(
        @InjectRepository(Address)
        private readonly repo: Repository<Address>,
    ) { }

    /** Create an Address entity (does NOT persist) */
    createAddress(data: Partial<Address>): Address {
        return this.repo.create(data);
    }

    /** Persist an Address entity */
    async saveAddress(address: Address, manager?: EntityManager): Promise<Address> {
        const repo = manager ? manager.getRepository(Address) : this.repo;
        return repo.save(address);
    }

    /** Find addresses for a given userId and entityType ('user' | 'patient') */
    async findByUserIdAndEntityType(
        userId: string,
        entityType: string,
    ): Promise<Address[]> {
        return this.repo.find({
            where: { userId, entityType },
        });
    }

    /** Delete all addresses for a given userId and entityType */
    async deleteByUserIdAndEntityType(
        userId: string,
        entityType: string,
    ): Promise<void> {
        await this.repo.delete({ userId, entityType });
    }
}
