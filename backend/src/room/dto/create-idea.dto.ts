import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { IdeaStatus } from '../entities/idea.entity';

export class CreateIdeaDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IdeaStatus)
  status?: IdeaStatus;

  @IsOptional()
  @IsString()
  linked_code_id?: string;
}

