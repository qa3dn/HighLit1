import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Log for debugging
    if (err) {
      console.error('JwtAuthGuard.handleRequest - Error:', err);
      throw err;
    }
    if (info) {
      console.error('JwtAuthGuard.handleRequest - JWT Info:', info);
      console.error('JwtAuthGuard.handleRequest - Info message:', info?.message);
      throw new UnauthorizedException(info?.message || 'Invalid token');
    }
    if (!user) {
      console.error('JwtAuthGuard.handleRequest - No user found');
      throw new UnauthorizedException('Authentication required');
    }
    console.log('JwtAuthGuard.handleRequest - User found:', { id: user.id, username: user.username });
    return user;
  }
}

