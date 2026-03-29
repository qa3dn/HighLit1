import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CompanyReview } from './company-review.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_name: string;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column({ type: 'int', nullable: true })
  salary_range_min: number;

  @Column({ type: 'int', nullable: true })
  salary_range_max: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  posted_by: string;

  @ManyToOne(() => User, (user) => user.jobs)
  @JoinColumn({ name: 'posted_by' })
  user: User;

  @Column({ type: 'boolean', default: false })
  is_promoted: boolean;

  @OneToMany(() => CompanyReview, (review) => review.job)
  reviews: CompanyReview[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

