import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginResponse } from '../types/auth-responses';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /* ================= LOGIN ================= */
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<LoginResponse> {
    return this.authService.login(email, password);
  }

  /* ================= FORGOT PASSWORD ================= */
  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
  ): Promise<{ token: string } | null> {
    return this.authService.forgotPassword(email);
  }

  /* ================= RESET PASSWORD ================= */
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<null> {
    await this.authService.resetPassword(token, newPassword);
    return null;
  }
}
