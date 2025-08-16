/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import axios from 'axios';
import { CartItem } from 'apps/cart-service/src/entities/cart.entity';
import { catchError, firstValueFrom, timeout } from 'rxjs';
// import Stripe from 'stripe';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private WC_BASE_URL = process.env.WC_BASE_URL;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) { }

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

  private async createWCOrder(dto: CreateOrderDto, items: CartItem[]) {
    try {
      const url = `${this.WC_BASE_URL}/checkout/complete`;
      const wcItems = items.map((item) => ({
        product_id: Number(item.productId),
        quantity: item.quantity,
        variation:
          item.variation?.map((v: any) => ({
            attribute: v.attribute,
            value: v.value,
          })) || [],
      }));

      const order_data = {
        items: wcItems,
        customer_data: dto.customer_data,
        payment_method: "cod",
        payment_data: dto.payment_data,
      };

      const res = await axios.post(url, order_data);
      return res;
    } catch (error) {
      throw new NotFoundException(
        `Error in WooCommerce Create Order: ${error}`,
      );
    }
  }
  private async cancelWCOrder(orderID: string) {
    try {
      const url = `${this.WC_BASE_URL}/checkout/${orderID}`;
      const res = await axios.delete(url);
      return res;
    } catch (error) {
      throw new NotFoundException(
        `Error in WooCommerce Create Order: ${error}`,
      );
    }
  }

  async createOrder(userId: string, items: CartItem[], dto: CreateOrderDto): Promise<Order> {
    try {
      const res = await this.createWCOrder(dto, items);

      const totalOrderPrice = items.reduce(
        (sum: number, item) =>
          sum + (Number(item.price ?? 0) * Number(item.quantity ?? 1)),
        0
      );
      const currency = res.data.currency || 'egp';

      const line_items = items.map((item) => ({
        price_data: {
          currency,
          unit_amount: Math.round(Number(item.price ?? 0) * 100),
          product_data: {
            name: item.title ?? "",
            metadata: item.variation ? { variation: JSON.stringify(item.variation) } : {},
          },
        },
        quantity: Number(item.quantity ?? 1),
      }));

      let session;
      try {
        session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items,
          success_url: dto.success_url || 'https://your-frontend.com/order-complete?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: dto.cancel_url || 'https://your-frontend.com/order-cancelled',
          client_reference_id: String(userId),
          customer_email: dto.customer_data?.email,
          metadata: {
            wcOrderId: res.data.order_id,
            address: JSON.stringify(dto.customer_data),
          },
        });
      } catch (stripeError) {
        const cres = await this.cancelWCOrder(res.data.order_id);
        console.log("cancelled WC order due to stripe error:", cres.data);
        throw stripeError;
      }

      const order = this.orderRepository.create({
        wcOrderId: res.data.order_id,
        wcOrderStatus: res.data.order_status,
        wcPaymentStatus: res.data.payment_status,
        wcOrderKey: res.data.order_key,
        currency,
        total: totalOrderPrice.toString(),
        userId,
        items,
        customerData: dto.customer_data,
        paymentMethod: "stripe",
        paymentData: dto.payment_data,
        isPaid: false,
        isDelivered: false,
        stripeSessionId: session.id,
        stripeCheckoutUrl: session.url,
      });
      await this.orderRepository.save(order);

      await this.sendNotification(
        userId,
        'Order Created 🛒',
        `Your order (${order.wcOrderId}) has been created successfully.`
      );

      return order;
    } catch (error) {
      throw toRpc(error, 'Failed to create order');

    }
  }

  async getOrderById(id: string) {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order)
        throw new RpcException({ statusCode: 404, message: 'Order not found' });
      return order;
    } catch (error) {
      throw toRpc(error, 'Failed to get order by id');
    }
  }

  async getOrdersByUser(userId: string) {
    try {
      return await this.orderRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw toRpc(error, 'Failed to get orders by user');
    }
  }

  async markAsPaid(id: string) {
    try {
      const order = await this.getOrderById(id);
      order.isPaid = true;
      order.paidAt = new Date();
      await this.sendNotification(
        order.userId,
        'Order Paid 💵',
        `Your order (${order.wcOrderId}) has been marked as paid.`
      );
      return await this.orderRepository.save(order);
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as paid');
    }
  }

  async markOrderPaidBySessionId(sessionId: string) {
    const order = await this.orderRepository.findOne({ where: { stripeSessionId: sessionId } });
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      await this.orderRepository.save(order);
    }
  }

  async markAsDelivered(id: string) {
    try {
      const order = await this.getOrderById(id);
      order.isDelivered = true;
      order.deliveredAt = new Date();
      await this.sendNotification(
        order.userId,
        'Order Delivered 🚚',
        `Your order (${order.wcOrderId}) has been delivered.`
      );

      return await this.orderRepository.save(order);
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as delivered');
    }
  }

  async deleteOrder(id: string) {
    try {
      const result = await this.orderRepository.delete(id);
      if (result.affected === 0) {
        throw new RpcException({ statusCode: 404, message: 'Order not found' });
      }
      await this.sendNotification(
        id,
        'Order Deleted 🗑️',
        `Your order (${id}) has been deleted successfully.`
      );
      return { affected: result.affected };
    } catch (error) {
      throw toRpc(error, 'Failed to delete order');
    }
  }
}

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Orders microservice error';
  return new RpcException({ statusCode, message });
}
