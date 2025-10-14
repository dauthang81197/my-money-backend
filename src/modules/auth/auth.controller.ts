import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './services/auth.service';

import { LocalAuthGuard } from './guards/local-auth.quard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dtos/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterDto } from './dtos/register.dto';

@Controller('auth')
@ApiTags('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: any,
    @Body() dto: LoginDto
    // @Headers('user-agent') ua: string
  ) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.auth.login(req.user, !!dto.rememberMe, ip);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: any) {
    const { id, sid } = req.user as { id: string; sid: string };
    return this.auth.refreshTokens(id, sid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const { sid } = req.user as { id: string; sid: string };
    return this.auth.logout(sid);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }
}
