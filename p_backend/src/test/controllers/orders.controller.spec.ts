import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';

vi.mock('src/services/orders.service', () => ({
  OrdersService: class {},
}));

import { OrdersController } from 'src/controllers/orders.controller';
import { OrdersService } from 'src/services/orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {}, // ✅ mock service
        },
      ],
    }).compile();

    controller = moduleRef.get(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
