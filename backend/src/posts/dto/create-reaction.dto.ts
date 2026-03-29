import { IsNotEmpty, IsEnum } from 'class-validator';
import { ReactionType } from '../entities/reaction.entity';

export class CreateReactionDto {
  @IsNotEmpty()
  @IsEnum(ReactionType)
  type: ReactionType;
}

