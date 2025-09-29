export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IJwtProvider {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
