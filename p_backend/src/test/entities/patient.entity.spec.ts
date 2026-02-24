import { describe, it, expect } from 'vitest';
import { Patient } from 'src/entities/patient.entity';

describe('Patient Entity', () => {
  it('should create patient instance', () => {
    const patient = new Patient();
    expect(patient).toBeDefined();
    expect(patient).toBeInstanceOf(Patient);
  });

  it('should be an object instance', () => {
    const patient = new Patient();
    expect(typeof patient).toBe('object');
  });
});
