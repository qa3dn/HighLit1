import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDevNoteDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  linked_code_id?: string;
}

