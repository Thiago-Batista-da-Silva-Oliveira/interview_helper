import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IJwtProvider,
  JwtPayload,
} from '@infra/cryptography/interfaces/IJwtProvider';

@Injectable()
export class JwtProvider implements IJwtProvider {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
