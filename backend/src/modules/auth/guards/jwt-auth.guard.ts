import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, body } = request;
    
    this.logger.log(`==== REQUEST DETAILS ====`);
    this.logger.log(`Method: ${method}`);
    this.logger.log(`URL: ${url}`);
    this.logger.log(`Headers: ${JSON.stringify(headers)}`);
    
    if (method === 'POST' && body) {
      // Log request body for debugging, but be careful with sensitive data in production
      this.logger.log(`Body: ${JSON.stringify(body)}`);
    }
    
    // Check if the route is marked as public
    const handler = context.getHandler();
    const controller = context.getClass();
    
    this.logger.log(`Handler: ${handler.name}`);
    this.logger.log(`Controller: ${controller.name}`);
    
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);
    
    this.logger.log(`Is route public? ${isPublic}`);
    
    if (isPublic) {
      this.logger.log('Route is public, skipping JWT validation');
      return true;
    }
    
    this.logger.log('Route is protected, validating JWT');
    
    // For debugging purposes, let's handle the JWT validation ourselves
    try {
      return super.canActivate(context);
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid token or authentication required');
    }
  }
}
