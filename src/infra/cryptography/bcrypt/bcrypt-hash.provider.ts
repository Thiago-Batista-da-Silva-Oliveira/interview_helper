import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { IHashProvider } from '@infra/cryptography/interfaces/IHashProvider';

@Injectable()
export class BcryptHashProvider implements IHashProvider {
  private readonly saltRounds = 10;

  async hash(payload: string): Promise<string> {
    return hash(payload, this.saltRounds);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return compare(payload, hashed);
  }
}