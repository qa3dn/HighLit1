import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

export enum CodeVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  SHARED = 'SHARED',
}

@Entity('code_storage')
export class CodeStorage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column()
  language: string;

  @Column({ type: 'text' })
  code_body: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: CodeVisibility,
    default: CodeVisibility.PRIVATE,
  })
  visibility: CodeVisibility;

  @Column({ nullable: true, unique: true })
  share_token: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  linked_post_id: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ name: 'linked_post_id' })
  linked_post: Post;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

