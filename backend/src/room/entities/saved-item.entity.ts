import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SavedItemType {
  POST = 'POST',
  CODE = 'CODE',
  IDEA = 'IDEA',
}

@Entity('saved_items')
@Unique(['user_id', 'item_type', 'item_id'])
export class SavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: SavedItemType,
  })
  item_type: SavedItemType;

  @Column()
  item_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}

