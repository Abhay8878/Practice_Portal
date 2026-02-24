import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { CreateOrderDto } from 'src/dtos/orders/create-order.dto';

describe('CreateOrderDto', () => {
  it('should fail validation when empty', async () => {
    const dto = new CreateOrderDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
