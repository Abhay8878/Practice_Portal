import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { UsersController } from 'src/controllers/users.controller';
import { UsersService } from 'src/services/users.service';
describe('UsersController', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    const controller = moduleRef.get(UsersController);
    expect(controller).toBeDefined();
  });
});
