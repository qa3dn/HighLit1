import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { CodeVisibility } from '../entities/code-storage.entity';

export class CreateCodeStorageDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  code_body: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsNotEmpty()
  @IsEnum(CodeVisibility)
  visibility: CodeVisibility;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  linked_post_id?: string;
}

