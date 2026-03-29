import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  culture_rating: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  work_life_balance: number;

  @IsNotEmpty()
  @IsString()
  review_text: string;
}

