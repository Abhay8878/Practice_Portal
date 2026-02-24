import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) { }

    /** Find a single user by ID, optionally loading relations */
    async findById(
        id: string,
        relations?: string[],
    ): Promise<User | null> {
        return this.repo.findOne({
            where: { id },
            relations,
        });
    }

    /** Find a single user by email */
    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOne({ where: { email } });
    }

    /** Find user by email WITH password (select: false field) and addresses */
    async findByEmailWithPassword(email: string): Promise<User | null> {
        return this.repo
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.addresses', 'addresses')
            .where('user.email = :email', { email })
            .getOne();
    }

    /** Find a user by their reset password token */
    async findByResetToken(token: string): Promise<User | null> {
        return this.repo.findOne({
            where: { resetPasswordToken: token },
        });
    }

    /** Flexible find with a where clause and optional relations */
    async findAll(
        where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
        relations?: string[],
    ): Promise<User[]> {
        return this.repo.find({
            where,
            relations,
            order: { createdAt: 'DESC' },
        });
    }

    /** Paginated find with count */
    async findAndCount(
        where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
        options: { relations?: string[]; skip: number; take: number },
    ): Promise<[User[], number]> {
        return this.repo.findAndCount({
            where,
            relations: options.relations,
            order: { createdAt: 'DESC' },
            skip: options.skip,
            take: options.take,
        });
    }

    /** Create a User entity (does NOT persist) */
    createUser(data: Partial<User>): User {
        return this.repo.create(data);
    }

    /** Persist a User entity */
    async saveUser(user: User, manager?: EntityManager): Promise<User> {
        const repo = manager ? manager.getRepository(User) : this.repo;
        return repo.save(user);
    }

    /** Remove a User entity */
    async removeUser(user: User, manager?: EntityManager): Promise<User> {
        const repo = manager ? manager.getRepository(User) : this.repo;
        return repo.remove(user);
    }
}
