import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(createPostDto, user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all posts' })
  findAll(@Query('sort') sort: string) {
    return this.postsService.findAll(sort);
  }

  @Get('rants')
  @Public()
  @ApiOperation({ summary: 'Get all rants' })
  findRants(@Query('sort') sort: string) {
    return this.postsService.findRants(sort);
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending posts' })
  getTrending() {
    return this.postsService.getTrending();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get post by ID' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add reaction to post' })
  addReaction(
    @Param('id') postId: string,
    @CurrentUser() user: User,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.postsService.addReaction(postId, user.id, createReactionDto);
  }

  @Get(':id/reactions')
  @Public()
  @ApiOperation({ summary: 'Get post reactions' })
  getReactions(@Param('id') postId: string) {
    return this.postsService.getReactions(postId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to post' })
  addComment(
    @Param('id') postId: string,
    @CurrentUser() user: User,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.addComment(postId, user.id, createCommentDto);
  }

  @Get(':id/comments')
  @Public()
  @ApiOperation({ summary: 'Get post comments' })
  getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }

  @Get('tags')
  @Public()
  @ApiOperation({ summary: 'Get active tags' })
  getTags() {
    return this.postsService.getTags();
  }

  @Get('tags/:tag')
  @Public()
  @ApiOperation({ summary: 'Get posts by tag' })
  getPostsByTag(@Param('tag') tag: string) {
    return this.postsService.getPostsByTag(tag);
  }

  @Get('stats/daily')
  @Public()
  @ApiOperation({ summary: 'Get daily statistics' })
  getDailyStats() {
    return this.postsService.getDailyStats();
  }
}

