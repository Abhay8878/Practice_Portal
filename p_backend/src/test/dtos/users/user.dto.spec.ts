import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { UpdateUserDto } from 'src/dtos/users/update-user.dto';

describe('UpdateUserDto', () => {
  it('should allow empty update dto', async () => {
    const dto = new UpdateUserDto();
    const errors = await validate(dto);
    if (errors.length > 0) console.log(JSON.stringify(errors, null, 2));
    expect(errors.length).toBe(0);
  });
});
