import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Reaction } from '../../posts/entities/reaction.entity';
import { Comment } from '../../posts/entities/comment.entity';
import { Job } from '../../jobs/entities/job.entity';
import { CompanyReview } from '../../jobs/entities/company-review.entity';

export enum UserRank {
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  ARCHITECT = 'ARCHITECT',
}

export enum UserRole {
  USER = 'USER',      // مستخدم عادي
  ADMIN = 'ADMIN',    // أدمن
  COMPANY = 'COMPANY' // شركة
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  github_id: string;

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRank,
    default: UserRank.INTERN,
  })
  rank: UserRank;

  @Column({ type: 'int', default: 0 })
  reputation_points: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'text', nullable: true })
  status_text: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Job, (job) => job.posted_by)
  jobs: Job[];

  @OneToMany(() => CompanyReview, (review) => review.user)
  company_reviews: CompanyReview[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

