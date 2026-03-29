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
import { CodeStorage } from './code-storage.entity';

export enum IdeaStatus {
  IDEA = 'IDEA',
  WORKING = 'WORKING',
  CRAZY = 'CRAZY',
}

@Entity('ideas')
export class Idea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: IdeaStatus,
    default: IdeaStatus.IDEA,
  })
  status: IdeaStatus;

  @Column({ nullable: true })
  linked_code_id: string;

  @ManyToOne(() => CodeStorage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'linked_code_id' })
  linked_code: CodeStorage;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

