import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: any) {
    console.log('JwtStrategy.validate - payload:', payload);
    console.log('JwtStrategy.validate - payload.sub:', payload.sub);
    
    const user = await this.usersService.findOne(payload.sub);
    console.log('JwtStrategy.validate - user found:', user ? { id: user.id, username: user.username } : 'null');
    
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

