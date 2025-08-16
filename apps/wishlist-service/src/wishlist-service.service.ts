/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, Logger  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class WishlistServiceService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) { }
  private readonly logger = new Logger(WishlistServiceService.name);

  private async sendNotification(userId: string, title: string, body: string) {
    try {
      const { deviceToken } = await firstValueFrom(
        this.usersClient.send({ cmd: 'get-user-device-token' }, { userId }).pipe(
          timeout(3000),
          catchError(() => {
            this.logger.warn(`No notification token found for user ${userId}`);
            return [{ deviceToken: null }];
          }),
        ),
      );

      if (!deviceToken) return;

      await firstValueFrom(
        this.notificationsClient.send({ cmd: 'send_push_notification' }, {
          token: deviceToken,
          title,
          body,
          userId,
        }).pipe(
          timeout(3000),
          catchError((err) => {
            this.logger.error(`Failed to send notification: ${err.message}`);
            return [];
          }),
        ),
      );
    } catch (err) {
      this.logger.error('Error sending notification', err.stack);
    }
  }

  async addToWishlist(userId: string, dto: AddToWishlistDto) {
    try {
      const exists = await this.wishlistRepository.findOne({
        where: { userId, productId: dto.productId },
      });
      if (exists) return exists;
      const item = this.wishlistRepository.create({ ...dto, userId });
      await this.sendNotification(
        userId, 
        'Item added to wishlist ❤️', 
        `${dto.productName} has been added to your wishlist.`
      );
      return await this.wishlistRepository.save(item);
    } catch (error) {
      throw toRpc(error, 'Failed to add to wishlist');
    }
  }

  async isProductInWishlist(userId: string, productId: string) {
    try {
      const wishlistItem = await this.wishlistRepository.findOne({
        where: { userId, productId },
      });
      return { exists: !!wishlistItem };
    } catch (error) {
      throw toRpc(error, 'Failed to check product in wishlist');
    }
  }

  async removeFromWishlist(userId: string, dto: RemoveFromWishlistDto) {
    try {
      const item = await this.wishlistRepository.findOne({
        where: { userId, productId: dto.productId },
      });
      if (!item) throw new RpcException({ statusCode: 404, message: 'Item not found in wishlist' });
      await this.sendNotification(
        userId, 
        'Item removed from wishlist ❌', 
        `${item.productName} has been removed from your wishlist.`
      );
      return await this.wishlistRepository.remove(item);
    } catch (error) {
      throw toRpc(error, 'Failed to remove from wishlist');
    }
  }

  async getWishlist(userId: string) {
    try {
      if (!userId) {
        throw new RpcException({ statusCode: 400, message: 'User ID is required' });
      }
      return await this.wishlistRepository.find({ where: { userId } });
    } catch (error) {
      throw toRpc(error, 'Failed to retrieve wishlist');
    }
  }
}

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Wishlist microservice error';
  return new RpcException({ statusCode, message });
}
