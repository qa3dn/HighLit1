import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRank } from '../entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Reaction } from '../../posts/entities/reaction.entity';
import { Comment } from '../../posts/entities/comment.entity';

@Injectable()
export class RankCalculatorService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Reaction)
    private reactionRepository: Repository<Reaction>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async calculateUserRank(userId: string): Promise<UserRank> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return UserRank.INTERN;
    }

    // Get user statistics
    const [postsCount, reactionsReceived, commentsCount, reputation] =
      await Promise.all([
        this.postRepository.count({ where: { user_id: userId } }),
        this.getReactionsReceived(userId),
        this.commentRepository.count({ where: { user_id: userId } }),
        user.reputation_points,
      ]);

    // Calculate score
    const score =
      postsCount * 10 +
      reactionsReceived * 5 +
      commentsCount * 3 +
      reputation * 2;

    // Determine rank based on score
    if (score >= 10000) {
      return UserRank.ARCHITECT;
    } else if (score >= 5000) {
      return UserRank.SENIOR;
    } else if (score >= 2000) {
      return UserRank.MID;
    } else if (score >= 500) {
      return UserRank.JUNIOR;
    } else {
      return UserRank.INTERN;
    }
  }

  private async getReactionsReceived(userId: string): Promise<number> {
    const posts = await this.postRepository.find({
      where: { user_id: userId },
      select: ['id'],
    });

    if (posts.length === 0) {
      return 0;
    }

    const postIds = posts.map((post) => post.id);
    return this.reactionRepository.count({
      where: postIds.map((id) => ({ post_id: id })),
    });
  }

  async updateUserRank(userId: string): Promise<UserRank> {
    const newRank = await this.calculateUserRank(userId);
    await this.userRepository.update(userId, { rank: newRank });
    return newRank;
  }

  async addReputationPoints(
    userId: string,
    points: number,
  ): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return 0;
    }

    const newReputation = user.reputation_points + points;
    await this.userRepository.update(userId, {
      reputation_points: newReputation,
    });

    // Update rank if needed
    await this.updateUserRank(userId);

    return newReputation;
  }
}

