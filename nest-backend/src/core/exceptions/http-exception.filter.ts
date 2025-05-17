import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { IHttpExceptionResponse } from './http-exception-response.interface';
import { Request, Response } from 'express';
import { LoggingService } from '../logging/logging.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private _logger: LoggingService;

  constructor(loggingService: LoggingService) {
    this._logger = loggingService.createContextLogger(HttpExceptionFilter.name);
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const errorMessage =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as IHttpExceptionResponse).message || exception.message;

    const errorDetails =
      typeof errorResponse === 'object' && (errorResponse as IHttpExceptionResponse).error
        ? { error: (errorResponse as IHttpExceptionResponse).error }
        : {};

    const path = request.url;
    const timestamp = new Date().toISOString();
    const method = request.method;

    // Log the error
    this._logger.error(`${method} ${path} ${status}: ${errorMessage}`, exception.stack);

    // Send the error response
    response.status(status).json({
      statusCode: status,
      timestamp,
      path,
      method,
      message: errorMessage,
      ...errorDetails,
    });
  }
}
