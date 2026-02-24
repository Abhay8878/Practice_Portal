import { describe, it, expect } from 'vitest';
import { User } from 'src/entities/user.entity';
describe('User Entity', () => {
  it('should be defined', () => {
    const user = new User();
    expect(user).toBeDefined();
  });
});
