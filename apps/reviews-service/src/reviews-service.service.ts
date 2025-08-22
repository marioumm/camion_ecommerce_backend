/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Review } from './entities/review.entity';
import { Comment } from './entities/comment.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BuckyDropHttpService } from './shared/buckydrop-http.service';
import { mapException } from './utils/map-exception';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @Inject('ORDERS_SERVICE')
    private ordersClient: ClientProxy,
    private readonly buckyDropService: BuckyDropHttpService,
  ) { }

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    const { woocommerceProductId, orderId, rating, comment } = createReviewDto;

    try {
      const product = await this.buckyDropService.getProduct(woocommerceProductId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const order = await firstValueFrom(
        this.ordersClient.send('get_order_with_items', { orderId, userId })
      );

      this.logger.debug(`Order fetched: ${JSON.stringify(order)}`);

      if (!order || !(order.isDelivered || order.wcOrderStatus === 'completed')) {
        throw new ForbiddenException("You cannot review this product - order not delivered yet");
      }

      const hasProduct = order.items.some((item: any) => item.productId === woocommerceProductId);
      this.logger.debug(`Order contains product? ${hasProduct}`);

      if (!hasProduct) {
        throw new ForbiddenException('You did not purchase this product');
      }

      const existingReview = await this.reviewRepository.findOne({
        where: { userId, woocommerceProductId, orderId }
      });

      if (existingReview) {
        throw new ForbiddenException('You have already reviewed this product');
      }

      const newReview = this.reviewRepository.create({
        userId,
        woocommerceProductId,
        orderId,
        rating,
        productName: product.name,
        productSlug: product.slug,
        isVerifiedPurchase: true,
      });

      const savedReview = await this.reviewRepository.save(newReview);

      if (comment && comment.trim()) {
        const reviewComment = this.commentRepository.create({
          userId,
          reviewId: savedReview.id,
          comment: comment.trim(),
        });
        await this.commentRepository.save(reviewComment);
      }

      this.ordersClient.emit('review_created', {
        orderId,
        productId: woocommerceProductId,
        rating
      });

      return await this.reviewRepository.findOne({
        where: { id: savedReview.id },
        relations: ['comments']
      });

    } catch (error) {
      this.logger.error('Error creating review:', error.message);
      throw mapException(error);
    }
  }

  async addComment(userId: string, createCommentDto: CreateCommentDto) {
    const { reviewId, comment } = createCommentDto;

    try {
      const review = await this.reviewRepository.findOne({
        where: { id: reviewId },
        relations: ['comments']
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      const newComment = this.commentRepository.create({
        userId,
        reviewId,
        comment: comment.trim(),
      });

      return await this.commentRepository.save(newComment);

    } catch (error) {
      this.logger.error('Error adding comment:', error.message);
      throw mapException(error);
    }
  }

  async getProductReviews(woocommerceProductId: number, page: number = 1, limit: number = 10) {
    try {
      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { woocommerceProductId, isActive: true },
        relations: ['comments'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const result = await this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'average')
        .addSelect('COUNT(review.id)', 'count')
        .where('review.woocommerceProductId = :productId', { productId: woocommerceProductId })
        .andWhere('review.isActive = :isActive', { isActive: true })
        .getRawOne();

      const ratingDistribution = await this.getRatingDistribution(woocommerceProductId);

      return {
        reviews,
        total,
        averageRating: parseFloat(result.average) || 0,
        totalReviews: parseInt(result.count) || 0,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        ratingDistribution
      };

    } catch (error) {
      this.logger.error('Error getting product reviews:', error.message);
      throw mapException(error);
    }
  }

  async canUserReview(userId: string, woocommerceProductId: number): Promise<boolean> {
    this.logger.debug(`Checking review permission for userId=${userId}, productId=${woocommerceProductId}`);

    try {
      const product = await this.buckyDropService.getProduct(woocommerceProductId);
      if (!product) {
        this.logger.debug('Product not found in BuckyDrop service');
        return false;
      }

      const completedOrders = await firstValueFrom(
        this.ordersClient.send('get_user_completed_orders', { userId })
      );

      this.logger.debug(`Completed orders fetched: ${JSON.stringify(completedOrders)}`);

      const hasPurchased = completedOrders.some((order: any) =>
        order.items.some((item: any) => item.productId === woocommerceProductId)
      );

      this.logger.debug(`Has purchased product? ${hasPurchased}`);

      if (!hasPurchased) return false;

      const existingReview = await this.reviewRepository.findOne({
        where: { userId, woocommerceProductId }
      });

      this.logger.debug(`Existing review found? ${existingReview ? 'YES' : 'NO'}`);

      return !existingReview;

    } catch (error) {
      this.logger.error('Error checking review permission:', error.message);
      return false;
    }
  }

  async getUserReviews(userId: string, page: number = 1, limit: number = 10) {
    try {
      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { userId, isActive: true },
        relations: ['comments'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        reviews,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      };

    } catch (error) {
      this.logger.error('Error getting user reviews:', error.message);
      throw mapException(error);
    }
  }

  private async getRatingDistribution(productId: number) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.woocommerceProductId = :productId', { productId })
      .andWhere('review.isActive = :isActive', { isActive: true })
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany();

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    result.forEach((item: any) => {
      distribution[Math.floor(item.rating)] = parseInt(item.count);
    });

    return distribution;
  }

  async deleteComment(userId: string, commentId: string) {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId, userId }
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return await this.commentRepository.remove(comment);

    } catch (error) {
      this.logger.error('Error deleting comment:', error.message);
      throw mapException(error);
    }
  }
}
