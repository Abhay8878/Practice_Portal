import { describe, it, expect } from 'vitest';
import { OrderStatus } from 'src/enums/order-status.enum';
describe('OrderStatus Enum', () => {
  it('should be defined', () => {
    expect(OrderStatus).toBeDefined();
  });
});
