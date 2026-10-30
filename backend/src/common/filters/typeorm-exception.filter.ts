import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// PostgreSQL error codes:
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_CHECK_VIOLATION = '23514';

/**
 * Turns database constraint errors into proper HTTP responses.
 * Services check most of these cases first; this is the safety net
 * for anything that still reaches the database (e.g. two identical
 * requests at the same moment).
 */
@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const code = (exception.driverError as { code?: string } | undefined)?.code;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected database error';

    switch (code) {
      case PG_UNIQUE_VIOLATION:
        status = HttpStatus.CONFLICT;
        message = 'A record with these values already exists';
        break;
      case PG_FOREIGN_KEY_VIOLATION:
        status = HttpStatus.BAD_REQUEST;
        message = 'A related record does not exist';
        break;
      case PG_CHECK_VIOLATION:
        status = HttpStatus.BAD_REQUEST;
        message = 'A value is outside the allowed range';
        break;
      default:
        this.logger.error(exception.message, exception.stack);
    }

    response
      .status(status)
      .json({ statusCode: status, message, error: HttpStatus[status] });
  }
}
