import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { SavedItemType } from '../entities/saved-item.entity';

export class CreateSavedItemDto {
  @IsNotEmpty()
  @IsEnum(SavedItemType)
  item_type: SavedItemType;

  @IsNotEmpty()
  @IsString()
  item_id: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

