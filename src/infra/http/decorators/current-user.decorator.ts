import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '@modules/user/dtos/UserResponseDto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.token;
  },
);