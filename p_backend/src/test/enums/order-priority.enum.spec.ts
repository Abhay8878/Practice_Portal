import { describe, it, expect } from 'vitest';
import { OrderPriority } from 'src/enums/order-priority.enum';
describe('OrderPriority Enum', () => {
  it('should be defined', () => {
    expect(OrderPriority).toBeDefined();
  });

  it('should contain expected values', () => {
    expect(OrderPriority.HIGH).toBeDefined();
    expect(OrderPriority.MEDIUM).toBeDefined();
    expect(OrderPriority.LOW).toBeDefined();
  });
});
