import { PasswordHashPort } from '@/@shared/password_hash';
import * as bcrypt from 'bcrypt';

export class BcryptPasswordHashAdapter implements PasswordHashPort {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(hash: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
