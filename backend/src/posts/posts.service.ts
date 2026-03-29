import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post, PostType } from './entities/post.entity';
import { CodeSnippet } from './entities/code-snippet.entity';
import { Reaction, ReactionType } from './entities/reaction.entity';
import { Comment } from './entities/comment.entity';
import { Tag } from '../shared/entities/tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AnonymousHashUtil } from '../auth/utils/anonymous-hash.util';
import { ModerationUtil } from '../auth/utils/moderation.util';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(CodeSnippet)
    private codeSnippetsRepository: Repository<CodeSnippet>,
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto, userId?: string): Promise<Post> {
    // Moderate content
    const moderation = ModerationUtil.moderateContent(createPostDto.content);
    if (!moderation.isClean) {
      throw new BadRequestException('Content contains inappropriate language');
    }
    // Note: hasWarning is handled on frontend

    // Generate anonymous hash if needed
    let anonymousHash: string | null = null;
    if (createPostDto.is_anonymous && userId) {
      anonymousHash = AnonymousHashUtil.generatePostHash(userId, 'temp');
    }

    // Create post
    const post = this.postsRepository.create({
      content: moderation.cleanedContent,
      type: createPostDto.type,
      is_anonymous: createPostDto.is_anonymous || false,
      anonymous_hash: anonymousHash,
      is_roast_enabled: createPostDto.is_roast_enabled || false,
      user_id: createPostDto.is_anonymous ? null : userId,
    });

    const savedPost = await this.postsRepository.save(post);

    // Update anonymous hash with actual post ID
    if (savedPost.is_anonymous && userId) {
      savedPost.anonymous_hash = AnonymousHashUtil.generatePostHash(
        userId,
        savedPost.id,
      );
      await this.postsRepository.save(savedPost);
    }

    // Create code snippets if provided
    if (createPostDto.code_snippets && createPostDto.code_snippets.length > 0) {
      const snippets = createPostDto.code_snippets.map((snippet) =>
        this.codeSnippetsRepository.create({
          ...snippet,
          post_id: savedPost.id,
        }),
      );
      await this.codeSnippetsRepository.save(snippets);
    }

    // Handle tags
    if (createPostDto.tags && createPostDto.tags.length > 0) {
      await this.attachTags(savedPost.id, createPostDto.tags);
    }

    // Add reputation points for creating post
    if (userId) {
      await this.usersService.updateReputation(userId, 5);
    }

    return this.findOne(savedPost.id);
  }

  async findAll(sort: string = 'recent'): Promise<Post[]> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.code_snippets', 'code_snippets')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.tags', 'tags');

    if (sort === 'trending') {
      queryBuilder
        .addSelect('COUNT(reactions.id)', 'reactions_count')
        .groupBy('post.id')
        .orderBy('reactions_count', 'DESC');
    } else {
      queryBuilder.orderBy('post.created_at', 'DESC');
    }

    return queryBuilder.getMany();
  }

  async findRants(sort: string = 'recent'): Promise<Post[]> {
    if (sort === 'most_solidarity') {
      // Sort by FEEL_YOU + HAPPENED_TO_ME reactions
      return this.postsRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.reactions', 'reactions')
        .leftJoinAndSelect('post.comments', 'comments')
        .leftJoinAndSelect('post.tags', 'tags')
        .leftJoin('post.reactions', 'solidarity_reactions', 'solidarity_reactions.type IN (:...types)', {
          types: [ReactionType.FEEL_YOU, ReactionType.HAPPENED_TO_ME],
        })
        .where('post.type = :type', { type: PostType.RANT })
        .addSelect('COUNT(DISTINCT solidarity_reactions.id)', 'solidarity_count')
        .groupBy('post.id')
        .addGroupBy('user.id')
        .orderBy('solidarity_count', 'DESC')
        .getMany();
    } else if (sort === 'most_comments') {
      return this.postsRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.reactions', 'reactions')
        .leftJoinAndSelect('post.comments', 'comments')
        .leftJoinAndSelect('post.tags', 'tags')
        .where('post.type = :type', { type: PostType.RANT })
        .addSelect('COUNT(DISTINCT comments.id)', 'comments_count')
        .groupBy('post.id')
        .addGroupBy('user.id')
        .orderBy('comments_count', 'DESC')
        .getMany();
    } else {
      return this.postsRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.reactions', 'reactions')
        .leftJoinAndSelect('post.comments', 'comments')
        .leftJoinAndSelect('post.tags', 'tags')
        .where('post.type = :type', { type: PostType.RANT })
        .orderBy('post.created_at', 'DESC')
        .getMany();
    }
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: [
        'user',
        'code_snippets',
        'reactions',
        'reactions.user',
        'comments',
        'comments.user',
        'comments.replies',
        'tags',
      ],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async addReaction(
    postId: string,
    userId: string,
    createReactionDto: CreateReactionDto,
  ): Promise<Reaction> {
    const post = await this.findOne(postId);

    // Check if reaction already exists
    const existing = await this.reactionsRepository.findOne({
      where: {
        post_id: postId,
        user_id: userId,
        type: createReactionDto.type,
      },
    });

    if (existing) {
      // Remove reaction (toggle)
      await this.reactionsRepository.remove(existing);
      return null;
    }

    // Create new reaction
    const reaction = this.reactionsRepository.create({
      post_id: postId,
      user_id: userId,
      type: createReactionDto.type,
    });

    const savedReaction = await this.reactionsRepository.save(reaction);

    // Add reputation to post author
    if (post.user_id) {
      await this.usersService.updateReputation(post.user_id, 2);
    }

    return savedReaction;
  }

  async getReactions(postId: string): Promise<Reaction[]> {
    return this.reactionsRepository.find({
      where: { post_id: postId },
      relations: ['user'],
    });
  }

  async addComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.findOne(postId);

    const comment = this.commentsRepository.create({
      post_id: postId,
      user_id: userId,
      content: createCommentDto.content,
      parent_id: createCommentDto.parent_id || null,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Add reputation to post author
    if (post.user_id) {
      await this.usersService.updateReputation(post.user_id, 1);
    }

    // Add reputation to commenter
    await this.usersService.updateReputation(userId, 1);

    return this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'replies'],
    });
  }

  async getComments(postId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { post_id: postId, parent_id: null },
      relations: ['user', 'replies', 'replies.user'],
      order: { created_at: 'DESC' },
    });
  }

  async getTrending(): Promise<Post[]> {
    return this.findAll('trending');
  }

  async getTags(): Promise<Tag[]> {
    // Get tags with post count, ordered by most used
    return this.tagsRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.posts', 'post')
      .addSelect('COUNT(post.id)', 'post_count')
      .where('post.type = :type', { type: PostType.RANT })
      .groupBy('tag.id')
      .orderBy('post_count', 'DESC')
      .limit(20)
      .getMany();
  }

  async getPostsByTag(tagSlug: string): Promise<Post[]> {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.tags', 'tags')
      .innerJoin('post.tags', 'tag', 'tag.slug = :tagSlug', { tagSlug })
      .where('post.type = :type', { type: PostType.RANT })
      .orderBy('post.created_at', 'DESC')
      .getMany();
  }

  async getDailyStats(): Promise<{
    totalReactions: number;
    feelYouCount: number;
    totalRants: number;
    topTag: { name: string; count: number } | null;
    topRant: Post | null;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rants = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.type = :type', { type: PostType.RANT })
      .andWhere('post.created_at >= :today', { today })
      .getMany();

    const totalRants = rants.length;
    const allReactions = rants.flatMap((post) => post.reactions || []);
    const totalReactions = allReactions.length;
    const feelYouCount = allReactions.filter(
      (r) => r.type === ReactionType.FEEL_YOU,
    ).length;

    // Get top tag
    const tagCounts = new Map<string, number>();
    rants.forEach((post) => {
      (post.tags || []).forEach((tag) => {
        tagCounts.set(tag.name, (tagCounts.get(tag.name) || 0) + 1);
      });
    });

    let topTag: { name: string; count: number } | null = null;
    tagCounts.forEach((count, name) => {
      if (!topTag || count > topTag.count) {
        topTag = { name, count };
      }
    });

    // Get top rant (most reactions)
    const topRant =
      rants.reduce((prev, current) => {
        const prevReactions = (prev.reactions || []).length;
        const currentReactions = (current.reactions || []).length;
        return currentReactions > prevReactions ? current : prev;
      }, rants[0]) || null;

    return {
      totalReactions,
      feelYouCount,
      totalRants,
      topTag,
      topRant,
    };
  }

  private async attachTags(postId: string, tagNames: string[]): Promise<void> {
    const tags: Tag[] = [];

    for (const tagName of tagNames) {
      let tag = await this.tagsRepository.findOne({
        where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
      });

      if (!tag) {
        tag = this.tagsRepository.create({
          name: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, '-'),
        });
        tag = await this.tagsRepository.save(tag);
      }

      tags.push(tag);
    }

    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['tags'],
    });

    if (post) {
      post.tags = tags;
      await this.postsRepository.save(post);
    }
  }
}

