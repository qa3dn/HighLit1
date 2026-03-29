import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('code_snippets')
export class CodeSnippet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_id: string;

  @ManyToOne(() => Post, (post) => post.code_snippets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column()
  language: string;

  @Column({ type: 'text' })
  code_body: string;

  @Column({ nullable: true })
  gist_url: string;

  @CreateDateColumn()
  created_at: Date;
}

