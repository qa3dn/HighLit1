import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CodeSnippet } from './code-snippet.entity';
import { Reaction } from './reaction.entity';
import { Comment } from './comment.entity';
import { Tag } from '../../shared/entities/tag.entity';

export enum PostType {
  RANT = 'RANT',
  CODE = 'CODE',
  JOB = 'JOB',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User, (user) => user.posts, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.RANT,
  })
  type: PostType;

  @Column({ type: 'boolean', default: false })
  is_anonymous: boolean;

  @Column({ nullable: true })
  anonymous_hash: string;

  @Column({ type: 'boolean', default: false })
  is_roast_enabled: boolean;

  @OneToMany(() => CodeSnippet, (snippet) => snippet.post, { cascade: true })
  code_snippets: CodeSnippet[];

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reactions: Reaction[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.posts)
  tags: Tag[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

