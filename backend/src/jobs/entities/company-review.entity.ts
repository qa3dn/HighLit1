import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from '../../users/entities/user.entity';

@Entity('company_reviews')
export class CompanyReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  job_id: string;

  @ManyToOne(() => Job, (job) => job.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.company_reviews)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'int' })
  culture_rating: number; // 1-5

  @Column({ type: 'int' })
  work_life_balance: number; // 1-5

  @Column({ type: 'text' })
  review_text: string;

  @CreateDateColumn()
  created_at: Date;
}

