import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from '../posts.service';
import { CreateCodePostDto } from '../dto/create-code-post.dto';
import { ReviewRequestDto } from '../dto/review-request.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PostType } from '../entities/post.entity';
import { GistIntegrationService } from '../services/gist-integration.service';
import { CodeParserService } from '../services/code-parser.service';

@ApiTags('posts')
@Controller('posts/code')
export class CodeController {
  constructor(
    private readonly postsService: PostsService,
    private readonly gistIntegrationService: GistIntegrationService,
    private readonly codeParserService: CodeParserService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a code post' })
  async createCodePost(
    @Body() createCodePostDto: CreateCodePostDto,
    @CurrentUser() user: User,
  ) {
    const createPostDto = {
      content: createCodePostDto.content,
      type: PostType.CODE,
      is_anonymous: false,
      is_roast_enabled: createCodePostDto.is_roast_enabled || false,
      tags: createCodePostDto.tags,
      code_snippets: [],
    };

    const post = await this.postsService.create(createPostDto, user.id);

    // If Gist URL provided, parse and add snippets
    if (createCodePostDto.gist_url) {
      await this.codeParserService.parseGistToSnippets(
        createCodePostDto.gist_url,
        post.id,
      );
    }

    return this.postsService.findOne(post.id);
  }

  @Patch(':id/roast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable/disable roast mode for code post' })
  async toggleRoastMode(
    @Param('id') postId: string,
    @CurrentUser() user: User,
    @Body('enabled') enabled: boolean,
  ) {
    const post = await this.postsService.findOne(postId);

    if (post.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    // Update roast mode (this would need to be added to PostsService)
    // For now, we'll return the post
    return post;
  }

  @Post(':id/review-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request code review from senior developers' })
  async requestReview(
    @Param('id') postId: string,
    @CurrentUser() user: User,
    @Body() reviewRequestDto: ReviewRequestDto,
  ) {
    const post = await this.postsService.findOne(postId);

    if (post.type !== PostType.CODE) {
      throw new Error('Post is not a code post');
    }

    // TODO: Implement notification system to notify senior developers
    // For now, just return success
    return {
      message: 'Review request sent to senior developers',
      post_id: postId,
      requested_from: reviewRequestDto.senior_user_ids,
    };
  }
}

