import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PractitionerType, UserStatus } from '../entities/user.entity';
import * as crypto from 'crypto';

import { LoginResponse } from '../types/auth-responses';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /* ================= LOGIN ================= */
  async login(email: string, password: string): Promise<LoginResponse> {
    // ✅ Normalize email from frontend
    const normalizedEmail = email.trim().toLowerCase();

    const user =
      await this.usersService.findByEmailWithPassword(normalizedEmail);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      ![
        PractitionerType.ADMIN,
        PractitionerType.TEAM_MEMBER,
        PractitionerType.PRACTICE,
      ].includes(user.practitionerType)
    ) {
      throw new UnauthorizedException('Access denied');
    }

    // Block INACTIVE users
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException(
        'Your account is inactive. Please contact admin.',
      );
    }

    if (user.status === UserStatus.INVITED) {
      await this.usersService.update(user.id, {
        status: UserStatus.ACTIVE,
      });
    }

    // Tenant resolution
    const tenantId =
      user.practitionerType === PractitionerType.PRACTICE
        ? user.id
        : user.tenantId || user.id;

    const addressId =
      user.addresses && user.addresses.length > 0 ? user.addresses[0].id : null;

    return {
      accessToken: 'dummy-token',
      practitionerType: user.practitionerType,
      userId: user.id,
      tenantId,
      addressId,
    };
  }

  /* ================= FORGOT PASSWORD ================= */
  async forgotPassword(email: string): Promise<{ token: string } | null> {
    //  Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(normalizedEmail);

    //  Security best practice: do NOT reveal user existence
    if (!user) {
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.usersService.update(user.id, user);

    // DEV only
    console.log('RESET TOKEN (DEV ONLY):', token);

    return { token };
  }

  /* ================= RESET PASSWORD ================= */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByResetToken(token);

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Token invalid or expired');
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.usersService.update(user.id, user);
  }
}

