import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { CodeVisibility } from '../entities/code-storage.entity';

export class UpdateCodeStorageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  code_body?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(CodeVisibility)
  visibility?: CodeVisibility;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  linked_post_id?: string;
}

