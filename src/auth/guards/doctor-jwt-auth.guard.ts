import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { Types } from 'mongoose';

import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

interface DoctorJwtPayload {
  sub: string;
  doctorId: string;
  tokenType: 'doctor';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedDoctorRequest
  extends Request {
  doctor: {
    doctorId: string;
  };
}

@Injectable()
export class DoctorJwtAuthGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (isPublic) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedDoctorRequest>();

    const token =
      this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Authentication token is required',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<DoctorJwtPayload>(
          token,
        );

      const isValidDoctorToken =
        payload.tokenType === 'doctor' &&
        payload.doctorId === payload.sub &&
        Types.ObjectId.isValid(
          payload.doctorId,
        );

      if (!isValidDoctorToken) {
        throw new UnauthorizedException();
      }

      request.doctor = {
        doctorId: payload.doctorId,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Authentication token is invalid or expired',
      );
    }
  }

  private extractBearerToken(
    request: Request,
  ): string | undefined {
    const authorization =
      request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [type, token] =
      authorization.trim().split(/\s+/);

    if (
      type?.toLowerCase() !== 'bearer' ||
      !token
    ) {
      return undefined;
    }

    return token;
  }
}