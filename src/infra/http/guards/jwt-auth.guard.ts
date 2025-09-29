import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidateTokenService } from '@modules/user/useCases/ValidateToken/ValidateTokenService';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly validateTokenService: ValidateTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request) || this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const user = await this.validateTokenService.execute({ token });
      request.user = user;
      request.token = token;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: any): string | undefined {
    return request.cookies?.token;
  }
}