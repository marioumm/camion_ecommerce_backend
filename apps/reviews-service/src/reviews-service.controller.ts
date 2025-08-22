/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/reviews/reviews.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewsService } from './reviews-service.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { mapException } from './utils/map-exception';

@Controller()
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);

  constructor(private readonly reviewsService: ReviewsService) {}

  @MessagePattern('create_review')
  async createReview(@Payload() data: { userId: string } & CreateReviewDto) {
    try {
      const { userId, ...createReviewDto } = data;
      const result = await this.reviewsService.createReview(userId, createReviewDto);
      return {
        status: 201,
        message: 'Review created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error creating review:', error.message);
      throw mapException(error);
    }
  }

  @MessagePattern('add_comment')
  async addComment(@Payload() data: { userId: string } & CreateCommentDto) {
    try {
      const { userId, ...createCommentDto } = data;
      const result = await this.reviewsService.addComment(userId, createCommentDto);
      return {
        status: 201,
        message: 'Comment added successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error adding comment:', error.message);
      throw mapException(error);
    }
  }

  @MessagePattern('get_product_reviews')
  async getProductReviews(@Payload() data: { productId: number; page?: number; limit?: number }) {
    try {
      const { productId, page = 1, limit = 10 } = data;
      const result = await this.reviewsService.getProductReviews(productId, page, limit);
      return {
        status: 200,
        message: 'Product reviews retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error getting product reviews:', error.message);
      throw mapException(error);
    }
  }

  @MessagePattern('can_user_review')
  async canReview(@Payload() data: { userId: string; productId: number }) {
    try {
      const result = await this.reviewsService.canUserReview(data.userId, data.productId);
      return {
        status: 200,
        message: 'Review permission checked',
        data: { canReview: result },
      };
    } catch (error) {
      this.logger.error('Error checking review permission:', error.message);
      throw mapException(error);
    }
  }

  @MessagePattern('get_user_reviews')
  async getUserReviews(@Payload() data: { userId: string; page?: number; limit?: number }) {
    try {
      const { userId, page = 1, limit = 10 } = data;
      const result = await this.reviewsService.getUserReviews(userId, page, limit);
      return {
        status: 200,
        message: 'User reviews retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error getting user reviews:', error.message);
      throw mapException(error);
    }
  }

  @MessagePattern('delete_comment')
  async deleteComment(@Payload() data: { userId: string; commentId: string }) {
    try {
      await this.reviewsService.deleteComment(data.userId, data.commentId);
      return {
        status: 200,
        message: 'Comment deleted successfully',
        data: null,
      };
    } catch (error) {
      this.logger.error('Error deleting comment:', error.message);
      throw mapException(error);
    }
  }
}
