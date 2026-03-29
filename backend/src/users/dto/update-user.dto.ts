import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRank, UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsEnum(UserRank)
  rank?: UserRank;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

