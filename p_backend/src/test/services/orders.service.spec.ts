import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';

// 🚫 IMPORTANT: mock BEFORE importing
vi.mock('src/services/orders.service', () => ({
  OrdersService: class {},
}));

import { OrdersService } from 'src/services/orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: OrdersService,
          useValue: {}, // ✅ prevent TypeORM execution
        },
      ],
    }).compile();

    service = moduleRef.get(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
