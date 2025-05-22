import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // First check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    this.logger.log(`RolesGuard - Is route public? ${isPublic}`);
    
    if (isPublic) {
      this.logger.log('RolesGuard - Route is public, skipping roles check');
      return true;
    }
    
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    this.logger.log(`RolesGuard - Required roles: ${requiredRoles}`);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.log('RolesGuard - No roles required, allowing access');
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    this.logger.log(`RolesGuard - User: ${JSON.stringify(user)}`);
    
    if (!user) {
      this.logger.warn('RolesGuard - No user found in request');
      throw new ForbiddenException('User not authenticated');
    }
    
    if (!requiredRoles.includes(user.role)) {
      this.logger.warn(`RolesGuard - User role ${user.role} not in required roles ${requiredRoles}`);
      throw new ForbiddenException('Insufficient role');
    }
    
    this.logger.log('RolesGuard - User has required role, allowing access');
    return true;
  }
}
