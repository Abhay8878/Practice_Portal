import { describe, it, expect } from 'vitest';
import { Address } from 'src/entities/address.entity';

describe('Address Entity', () => {
  it('should be defined', () => {
    const address = new Address();
    expect(address).toBeDefined();
  });

  it('should be instance of Address', () => {
    const address = new Address();
    expect(address).toBeInstanceOf(Address);
  });
});
