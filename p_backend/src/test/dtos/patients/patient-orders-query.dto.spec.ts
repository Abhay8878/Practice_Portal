import { describe, it, expect } from 'vitest';
import { PatientOrdersQueryDto } from 'src/dtos/orders/patient-orders-query.dto';

describe('PatientOrdersQueryDto', () => {
  it('should be defined', () => {
    const dto = new PatientOrdersQueryDto();
    expect(dto).toBeDefined();
  });
});
