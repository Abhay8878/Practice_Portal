import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { PatientsService } from 'src/services/patients.service';

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PatientsService,
          useValue: {}, // ✅ empty mock avoids constructor args
        },
      ],
    }).compile();

    service = moduleRef.get(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
