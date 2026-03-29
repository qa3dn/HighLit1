import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AnonymousHashUtil } from './utils/anonymous-hash.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGitHubUser(githubUser: {
    github_id: string;
    username: string;
    email: string;
    avatar_url: string;
  }): Promise<User> {
    let user = await this.usersService.findByGithubId(githubUser.github_id);

    if (!user) {
      // Create new user
      user = await this.usersService.create({
        github_id: githubUser.github_id,
        username: githubUser.username,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url,
      });
    } else {
      // Update user info
      user = await this.usersService.update(user.id, {
        avatar_url: githubUser.avatar_url,
      });
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create new user
    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
    });

    // Generate JWT token
    return this.login(user);
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has password (email/password user)
    if (!user.password) {
      throw new UnauthorizedException('Please use GitHub OAuth to login');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  generateAnonymousHash(userId: string): string {
    return AnonymousHashUtil.generateHash(userId, Date.now());
  }
}

