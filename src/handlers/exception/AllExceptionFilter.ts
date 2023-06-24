
import {
    ExceptionFilter,
    Catch,
    HttpException,
    ArgumentsHost,
    HttpStatus,
  } from '@nestjs/common';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status;
    let message;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      const msg = [];
      const error: Error = exception as Error;
      if (error.name) {
        msg.push(error.name);
      }
      if (error.message) {
        msg.push(error.message);
      }

      status = HttpStatus.INTERNAL_SERVER_ERROR;

      msg.push('Internal server error');

      message = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: msg,
      };
    }

    response.status(status).json(message);
  }
}