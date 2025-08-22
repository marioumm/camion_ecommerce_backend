import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  reviewId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  comment: string;
}
