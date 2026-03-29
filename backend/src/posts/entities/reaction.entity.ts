import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../users/entities/user.entity';

export enum ReactionType {
  FEEL_YOU = 'FEEL_YOU', // حاس فيك
  HAPPENED_TO_ME = 'HAPPENED_TO_ME', // صار معي
  TAKE_A_BREAK = 'TAKE_A_BREAK', // خذ بريك
  HELP_ME = 'HELP_ME', // حلّيلي؟
  GOD_HELP_YOU = 'GOD_HELP_YOU', // الله يعينك
  WORKS_FOR_ME = 'WORKS_FOR_ME', // كودك شغال عندي
}

@Entity('reactions')
@Unique(['post_id', 'user_id', 'type'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_id: string;

  @ManyToOne(() => Post, (post) => post.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.reactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  type: ReactionType;

  @CreateDateColumn()
  created_at: Date;
}

