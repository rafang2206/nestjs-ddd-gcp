import * as bcrypt from 'bcrypt';
import { BcryptPasswordHasherService } from './bcrypt-password-hasher.service';

describe('BcryptPasswordHasherService', () => {
  it('hashes a password using bcrypt', async () => {
    const service = new BcryptPasswordHasherService();
    const plainPassword = 'SecurePass123!';

    const hash = await service.hash(plainPassword);

    expect(hash).not.toBe(plainPassword);
    expect(hash).toMatch(/^\$2[aby]\$/);
    await expect(bcrypt.compare(plainPassword, hash)).resolves.toBe(true);
  });
});
