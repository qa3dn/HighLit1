import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Post, PostType } from '../entities/post.entity';

export enum StressLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Injectable()
export class StressAnalyzerService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  /**
   * Analyze stress level based on recent posts
   */
  async analyzeStressLevel(): Promise<{
    level: StressLevel;
    message: string;
    percentage: number;
  }> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get all rants from last 24 hours
    const recentRants = await this.postRepository.find({
      where: {
        type: PostType.RANT,
        created_at: Between(last24Hours, now),
      },
    });

    // Analyze keywords that indicate stress
    const stressKeywords = [
      'مشكلة',
      'مشاكل',
      'خطأ',
      'error',
      'bug',
      'crash',
      'مستحيل',
      'مش فاهم',
      'ضغط',
      'stress',
      'deadline',
      'production',
      'وقع',
      'تعطل',
    ];

    let stressCount = 0;
    recentRants.forEach((rant) => {
      const content = rant.content.toLowerCase();
      if (stressKeywords.some((keyword) => content.includes(keyword))) {
        stressCount++;
      }
    });

    const stressRatio = recentRants.length > 0 ? stressCount / recentRants.length : 0;
    const percentage = Math.round(stressRatio * 100);

    let level: StressLevel;
    let message: string;

    if (percentage >= 75) {
      level = StressLevel.CRITICAL;
      message = 'عالي التوتر - اليوم صعب شوي! 💥';
    } else if (percentage >= 50) {
      level = StressLevel.HIGH;
      message = 'توتر عالي - في مشاكل بالجو! ⚠️';
    } else if (percentage >= 25) {
      level = StressLevel.MEDIUM;
      message = 'توتر متوسط - الوضع عادي 😐';
    } else {
      level = StressLevel.LOW;
      message = 'هادئ - كل شي تمام! 😌';
    }

    return {
      level,
      message,
      percentage,
    };
  }
}

