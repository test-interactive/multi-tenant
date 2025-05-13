import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from header
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Missing access token');

    try {
      // Get super admin secret key
      const secret = await this.authService.fetchAccessTokenSecretSigningKey(
        'super-admin',
      );

      // Verify token with super admin secret
      const payload = await this.jwtService.verify(token, {
        secret,
      });

      // Check if the user is actually a super admin
      const isSuperAdmin = await this.usersService.isSuperAdmin(payload.userId);
      if (!isSuperAdmin) {
        throw new UnauthorizedException(
          'Only super admin can access this resource',
        );
      }

      // Add user info to request
      request.userInfo = {
        id: payload.userId,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid token or insufficient privileges',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}
