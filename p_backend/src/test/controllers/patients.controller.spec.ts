import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { PatientsController } from 'src/controllers/patients.controller';
import { PatientsService } from 'src/services/patients.service';
describe('PatientsController', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: {},
        },
      ],
    }).compile();

    const controller = moduleRef.get(PatientsController);
    expect(controller).toBeDefined();
  });
});
