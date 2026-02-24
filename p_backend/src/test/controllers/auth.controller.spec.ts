import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthService } from 'src/services/auth.service';
describe('AuthController', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    const controller = moduleRef.get(AuthController);
    expect(controller).toBeDefined();
  });
});
