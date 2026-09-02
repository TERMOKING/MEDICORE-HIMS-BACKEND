import {
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import type {
  NextFunction,
  Request,
  Response,
} from 'express';

interface DoctorRequest extends Request {
  doctor?: {
    doctorId?: string;
  };
}

@Injectable()
export class HttpLoggerMiddleware
  implements NestMiddleware
{
  private readonly logger = new Logger('HTTP');

  use(
    request: DoctorRequest,
    response: Response,
    next: NextFunction,
  ): void {
    const startedAt = process.hrtime.bigint();

    const requestId =
      this.getOrCreateRequestId(request);

    response.setHeader(
      'X-Request-Id',
      requestId,
    );

    const safePath =
      this.createSafePath(request.originalUrl);

    this.logger.log(
      JSON.stringify({
        event: 'request.received',
        requestId,
        method: request.method,
        path: safePath,
        contentType:
          request.headers['content-type'] ??
          null,
        contentLength:
          request.headers['content-length'] ??
          null,
        hasAuthorization:
          Boolean(
            request.headers.authorization,
          ),
        queryKeys: Object.keys(
          request.query ?? {},
        ),
        bodyKeys: this.getObjectKeys(
          request.body,
        ),
      }),
    );

    let responseLogged = false;

    const logResponse = (
      event:
        | 'response.sent'
        | 'response.aborted',
    ): void => {
      if (responseLogged) {
        return;
      }

      responseLogged = true;

      const durationNanoseconds =
        process.hrtime.bigint() - startedAt;

      const durationMilliseconds =
        Number(durationNanoseconds) /
        1_000_000;

      const logData = JSON.stringify({
        event,
        requestId,
        method: request.method,
        path: safePath,
        statusCode: response.statusCode,
        durationMs: Number(
          durationMilliseconds.toFixed(2),
        ),
        responseContentLength:
          response.getHeader(
            'content-length',
          ) ?? null,
        doctorId:
          request.doctor?.doctorId ?? null,
      });

      if (response.statusCode >= 500) {
        this.logger.error(logData);
        return;
      }

      if (response.statusCode >= 400) {
        this.logger.warn(logData);
        return;
      }

      this.logger.log(logData);
    };

    response.once('finish', () => {
      logResponse('response.sent');
    });

    response.once('close', () => {
      if (!response.writableEnded) {
        logResponse('response.aborted');
      }
    });

    next();
  }

  private getOrCreateRequestId(
    request: Request,
  ): string {
    const suppliedHeader =
      request.headers['x-request-id'];

    const suppliedRequestId =
      Array.isArray(suppliedHeader)
        ? suppliedHeader[0]
        : suppliedHeader;

    if (
      suppliedRequestId &&
      /^[A-Za-z0-9_-]{8,100}$/.test(
        suppliedRequestId,
      )
    ) {
      return suppliedRequestId;
    }

    return randomUUID();
  }

  private createSafePath(
    originalUrl: string,
  ): string {
    const pathWithoutQuery =
      originalUrl.split('?')[0] ?? '/';

    return pathWithoutQuery
      .replace(
        /\b[a-fA-F0-9]{24}\b/g,
        ':objectId',
      )
      .replace(
        /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g,
        ':uuid',
      );
  }

  private getObjectKeys(
    value: unknown,
  ): string[] {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value)
    ) {
      return [];
    }

    return Object.keys(
      value as Record<string, unknown>,
    ).slice(0, 50);
  }
}