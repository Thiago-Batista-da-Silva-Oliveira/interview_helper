import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegisterUserService } from '@modules/user/useCases/RegisterUser/RegisterUserService';
import { LoginUserService } from '@modules/user/useCases/LoginUser/LoginUserService';
import { LogoutUserService } from '@modules/user/useCases/LogoutUser/LogoutUserService';
import { LogoutAllSessionsService } from '@modules/user/useCases/LogoutAllSessions/LogoutAllSessionsService';
import { RegisterUserDto } from '@modules/user/dtos/RegisterUserDto';
import { LoginUserDto } from '@modules/user/dtos/LoginUserDto';
import { UserResponseDto } from '@modules/user/dtos/UserResponseDto';
import { Public } from '@infra/http/decorators/public.decorator';
import {
  CurrentUser,
  CurrentToken,
} from '@infra/http/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly loginUserService: LoginUserService,
    private readonly logoutUserService: LogoutUserService,
    private readonly logoutAllSessionsService: LogoutAllSessionsService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<UserResponseDto> {
    return this.registerUserService.execute(registerUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponseDto> {
    const result = await this.loginUserService.execute(loginUserDto);

    // Set HTTP-only cookie
    response.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentToken() token: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.logoutUserService.execute({ token });
    response.clearCookie('token');
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser() user: UserResponseDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.logoutAllSessionsService.execute({ userId: user.id });
    response.clearCookie('token');
  }

  @Get('me')
  async me(@CurrentUser() user: UserResponseDto): Promise<UserResponseDto> {
    return user;
  }
}
