import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { CodeSnippet } from './entities/code-snippet.entity';
import { Reaction } from './entities/reaction.entity';
import { Comment } from './entities/comment.entity';
import { Tag } from '../shared/entities/tag.entity';
import { StressAnalyzerService } from './services/stress-analyzer.service';
import { GistIntegrationService } from './services/gist-integration.service';
import { CodeParserService } from './services/code-parser.service';
import { UsersModule } from '../users/users.module';
import { StressController } from './controllers/stress.controller';
import { CodeController } from './controllers/code.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, CodeSnippet, Reaction, Comment, Tag]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    UsersModule,
  ],
  controllers: [PostsController, StressController, CodeController],
  providers: [
    PostsService,
    StressAnalyzerService,
    GistIntegrationService,
    CodeParserService,
  ],
  exports: [PostsService, StressAnalyzerService],
})
export class PostsModule {}

