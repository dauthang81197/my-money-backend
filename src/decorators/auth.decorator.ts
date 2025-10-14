import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Authenticate = () =>
  applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth());
