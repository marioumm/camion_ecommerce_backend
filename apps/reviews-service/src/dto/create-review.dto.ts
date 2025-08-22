import { IsNumber, IsString, IsNotEmpty, Min, Max, IsOptional, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  woocommerceProductId: number;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
