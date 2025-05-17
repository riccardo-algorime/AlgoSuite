import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { IHttpExceptionResponse } from './http-exception-response.interface';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggingService } from '../logging/logging.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private _logger: LoggingService;

  constructor(
    private readonly _httpAdapterHost: HttpAdapterHost,
    loggingService: LoggingService,
  ) {
    this._logger = loggingService.createContextLogger(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations like when starting up the server,
    // the HttpAdapterHost might not be available.
    const { httpAdapter } = this._httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    const errorDetails =
      exception instanceof HttpException && typeof exception.getResponse() === 'object'
        ? (exception.getResponse() as IHttpExceptionResponse).error
          ? { error: (exception.getResponse() as IHttpExceptionResponse).error }
          : {}
        : {};

    const path = httpAdapter.getRequestUrl(ctx.getRequest());
    const timestamp = new Date().toISOString();
    const method = ctx.getRequest().method;

    // Log the error
    this._logger.error(
      `${method} ${path} ${httpStatus}: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Send the error response
    const responseBody = {
      statusCode: httpStatus,
      timestamp,
      path,
      method,
      message: errorMessage,
      ...errorDetails,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
