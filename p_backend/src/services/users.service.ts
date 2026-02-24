import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource, FindOptionsWhere, In } from 'typeorm';
import {
  PractitionerType,
  Specialization,
  User,
} from '../entities/user.entity';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';

import { UserRepository } from '../repositories/user.repository';
import { AddressRepository } from '../repositories/address.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly addressRepo: AddressRepository,
    private readonly dataSource: DataSource,
  ) { }

  // ✅ CREATE USER
  async create(createUserDto: CreateUserDto): Promise<User> {
    // ✅ Normalize email
    const normalizedEmail = createUserDto.email.trim().toLowerCase();

    // ✅ Check if user already exists
    const existingUser = await this.userRepo.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException(
        `User with email ${normalizedEmail} already exists`,
      );
    }

    const { address, tenantId, ...userData } = createUserDto;

    // ✅ Default password
    const plainPassword = `${createUserDto.firstName}@2026`;

    // ✅ Create user in transaction
    const savedUser = await this.dataSource.transaction(async (manager) => {
      const user = this.userRepo.createUser({
        ...userData,
        email: normalizedEmail, // 👈 always lowercase
        specialization: userData.specialization as Specialization,
        password: plainPassword,
        tenantId: tenantId ?? null,
      });

      const saved = await this.userRepo.saveUser(user, manager);

      // ✅ Save address if provided
      if (address) {
        const addressEntity = this.addressRepo.createAddress({
          ...address,
          userId: saved.id,
          entityType: 'user',
          street: address.street ?? null,
          house_no: address.house_no ?? null,
          address_type: address.address_type ?? null,
          countryCode: address.countryCode ?? null,
        });

        await this.addressRepo.saveAddress(addressEntity, manager);
      }

      return saved;
    });

    // Return user with addresses
    return this.userRepo.findById(savedUser.id, ['addresses']);
  }

  // FIND ALL USERS
  private getWhereClause(practitionerType?: string, tenantId?: string) {
    const allowedTypes = [
      PractitionerType.ADMIN,
      PractitionerType.TEAM_MEMBER,
      PractitionerType.PRACTICE,
    ];

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[];

    if (practitionerType) {
      if (!allowedTypes.includes(practitionerType as PractitionerType)) {
        where = { id: 'none' }; // Force empty result if invalid type
      } else {
        where = { practitionerType: practitionerType as PractitionerType };
      }
    } else {
      where = { practitionerType: In(allowedTypes) };
    }

    if (tenantId) {
      where = Array.isArray(where)
        ? where.flatMap((w) => [
          { ...w, tenantId },
          { ...w, id: tenantId },
        ])
        : [
          { ...where, tenantId },
          { ...where, id: tenantId },
        ];
    }
    return where;
  }

  async findAll(practitionerType?: string, tenantId?: string): Promise<User[]> {
    const where = this.getWhereClause(practitionerType, tenantId);
    return this.userRepo.findAll(where, ['addresses']);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    practitionerType?: string,
    tenantId?: string,
  ) {
    const where = this.getWhereClause(practitionerType, tenantId);

    const [data, total] = await this.userRepo.findAndCount(where, {
      relations: ['addresses'],
      skip: (page - 1) * limit,
      take: limit,
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

  // FIND SINGLE USER
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findById(id, ['addresses']);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // UPDATE USER
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepo.findByEmail(updateUserDto.email);

      if (existingUser) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepo.saveUser(user);
  }

  // ✅ DELETE USER
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.removeUser(user);
  }

  // ✅ LOGIN HELPERS
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo.findByEmailWithPassword(email);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepo.findByResetToken(token);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }
}
