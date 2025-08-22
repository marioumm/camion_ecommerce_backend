/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JwtAuthGuard } from '@app/auth';
import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param, 
  Query, 
  Body, 
  UseGuards, 
  ParseIntPipe, 
  DefaultValuePipe,
  Inject
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateCommentDto } from 'apps/reviews-service/src/dto/create-comment.dto';
import { CreateReviewDto } from 'apps/reviews-service/src/dto/create-review.dto';
import { CurrentUserId } from 'libs/auth/src/current-user.decorator';
import { firstValueFrom } from 'rxjs';


@Controller('api/reviews')
export class ReviewsController {
  constructor(
    @Inject('REVIEWS_SERVICE') private reviewsClient: ClientProxy
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(
   @CurrentUserId() user: any, 
    @Body() createReviewDto: CreateReviewDto
  ) {
    const response = await firstValueFrom(
      this.reviewsClient.send('create_review', {
        userId: user.id,
        ...createReviewDto
      })
    );
    
    if (response.status !== 201) {
      throw new Error(response.message);
    }
    
    return response.data;
  }

  @Post('comment')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @CurrentUserId() user: any, 
    @Body() createCommentDto: CreateCommentDto
  ) {
    const response = await firstValueFrom(
      this.reviewsClient.send('add_comment', {
        userId: user.id,
        ...createCommentDto
      })
    );
    
    if (response.status !== 201) {
      throw new Error(response.message);
    }
    
    return response.data;
  }

  @Get('product/:productId')
  async getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    const response = await firstValueFrom(
      this.reviewsClient.send('get_product_reviews', {
        productId,
        page,
        limit
      })
    );
    
    if (response.status !== 200) {
      throw new Error(response.message);
    }
    
    return response.data;
  }

  @Get('can-review/:productId')
  @UseGuards(JwtAuthGuard)
  async canReview(
    @CurrentUserId() user: any, 
    @Param('productId', ParseIntPipe) productId: number
  ) {
    const response = await firstValueFrom(
      this.reviewsClient.send('can_user_review', {
        userId: user.id,
        productId
      })
    );
    
    return response.data;
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserReviews(
    @CurrentUserId() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    const response = await firstValueFrom(
      this.reviewsClient.send('get_user_reviews', {
        userId: user.id,
        page,
        limit
      })
    );
    
    if (response.status !== 200) {
      throw new Error(response.message);
    }
    
    return response.data;
  }

  @Delete('comment/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @CurrentUserId() user: any,
    @Param('commentId') commentId: string
  ) {
    const response = await firstValueFrom(
      this.reviewsClient.send('delete_comment', {
        userId: user.id,
        commentId
      })
    );
    
    if (response.status !== 200) {
      throw new Error(response.message);
    }
    
    return { message: 'Comment deleted successfully' };
  }
}
