import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { CreatePatientDto } from 'src/dtos/patients/create-patient.dto';
describe('CreatePatientDto', () => {
  it('should fail if required fields are missing', async () => {
    const dto = new CreatePatientDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
