import { Controller, Get, Post, Body, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @Public()
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  async githubAuth() {
    // Guard redirects to GitHub
  }

  @Get('github/callback')
  @Public()
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
    const result = await this.authService.login(user);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.access_token}`,
    );
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user with email/password' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    console.log('Register endpoint called with:', { username: registerDto.username, email: registerDto.email });
    try {
      const result = await this.authService.register(registerDto);
      console.log('Registration successful');
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto);
      return this.authService.login(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@Req() req: Request) {
    const user = req.user as any;
    
    // Ensure we return a clean user object with id
    if (!user) {
      console.error('AuthController.getMe - req.user is null or undefined');
      throw new UnauthorizedException('User not found in request');
    }
    
    if (!user.id) {
      console.error('AuthController.getMe - user.id is missing:', user);
      throw new UnauthorizedException('User ID is missing');
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      rank: user.rank,
      role: user.role,
      reputation_points: user.reputation_points,
      bio: user.bio,
      avatar_url: user.avatar_url,
      status_text: user.status_text,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  async health() {
    return {
      status: 'ok',
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
    };
  }
}

