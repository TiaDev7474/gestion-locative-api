import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const secret = this.config.get('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > payload.exp) {
        throw new UnauthorizedException(
          'Your session is expired, please login again',
        );
      }
      request['user'] = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, Token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? Token : 'undefined';
  }
}
