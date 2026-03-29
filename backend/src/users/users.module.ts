import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RankCalculatorService } from './services/rank-calculator.service';
import { Post } from '../posts/entities/post.entity';
import { Reaction } from '../posts/entities/reaction.entity';
import { Comment } from '../posts/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Reaction, Comment])],
  controllers: [UsersController],
  providers: [UsersService, RankCalculatorService],
  exports: [UsersService],
})
export class UsersModule {}

