import { IsNotEmpty, IsArray, IsString, IsOptional } from 'class-validator';

export class ReviewRequestDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  senior_user_ids: string[];

  @IsOptional()
  @IsString()
  message?: string;
}

