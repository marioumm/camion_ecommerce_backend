/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import * as crypto from 'crypto';
import { CartItem } from 'apps/cart-service/src/entities/cart.entity';
import { catchError, firstValueFrom, timeout } from 'rxjs';


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

  private SKIPCASH_BASE_URL = process.env.SKIPCASH_BASE_URL;

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
        line_items: wcItems,
        customer_data: dto.customer_data,
        payment_method: "skipcash",
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

  async createSkipCashPayment(orderId: string, amount: number, currency: string, customerData: any) {
    try {
      const url = `${this.SKIPCASH_BASE_URL}/api/v1/payments`;
      console.log('SKIPCASH_CLIENT_ID:', process.env.SKIPCASH_CLIENT_ID);
      console.log('SKIPCASH_BASE_URL:', this.SKIPCASH_BASE_URL);
      const payload = {
        Uid: this.generateUUID(),
        KeyId: process.env.SKIPCASH_KEY_ID,
        Amount: amount.toFixed(2),
        FirstName: customerData.first_name,
        LastName: customerData.last_name,
        Phone: customerData.phone,
        Email: customerData.email,
        Street: customerData.address_1,
        City: customerData.city,
        State: customerData.state,
        Country: customerData.country,
        PostalCode: customerData.postcode,
        TransactionId: String(orderId),
        Custom1: ""
      };

      const signature = this.generateSkipCashSignature(payload);


      console.log('SkipCash Payload:', JSON.stringify(payload, null, 2));
      console.log('Generated Signature:', signature);

      const res = await axios.post(url, payload, {
        headers: {
          'Authorization': signature,
          'Content-Type': 'application/json'
        }
      });
      console.log('SkipCash response data:', res.data);
      return res.data;
    } catch (error) {
      this.logger.error(`SkipCash payment failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error('SkipCash error details:', error.response.data);
      }
      throw new NotFoundException(`SkipCash payment error: ${error.message}`);
    }
  }

  private generateSkipCashSignature(payload: any): string {
    const orderedFields = [
      'Uid', 'KeyId', 'Amount', 'FirstName', 'LastName',
      'Phone', 'Email', 'Street', 'City', 'State',
      'Country', 'PostalCode', 'TransactionId', 'Custom1'
    ];

    const nonEmptyFields = orderedFields
      .filter(key => payload[key] && payload[key] !== '')
      .map(key => `${key}=${String(payload[key]).trim()}`)
      .join(',');


    console.log('Signature Base String:', nonEmptyFields);


    const signature = crypto
      .createHmac('sha256', process.env.SKIPCASH_KEY_SECRET || '')
      .update(nonEmptyFields)
      .digest('base64');


    return signature;

  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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

      const skipCashPayment = await this.createSkipCashPayment(
        res.data.order_id,
        totalOrderPrice,
        currency,
        dto.customer_data
      );

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
        paymentMethod: "skipcash",
        paymentData: dto.payment_data,
        isPaid: false,
        isDelivered: false,
        skipCashTransactionId: skipCashPayment.resultObj.transactionId,
        skipCashPaymentUrl: skipCashPayment.resultObj.payUrl,
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


  async markOrderPaidByTransaction(transactionId: string, paymentData: any) {
    try {
      const order = await this.orderRepository.findOne({
        where: { skipCashTransactionId: transactionId }
      });

      if (!order) {
        throw new RpcException({
          statusCode: 404,
          message: `Order not found for transaction: ${transactionId}`
        });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentData = paymentData;
      order.wcPaymentStatus = 'paid';

      await this.orderRepository.save(order);

      await this.sendNotification(
        order.userId,
        'Payment Confirmed 💳',
        `Your payment for order (${order.wcOrderId}) has been confirmed successfully.`
      );

      this.logger.log(`Order ${order.id} marked as paid via webhook`);
      return order;
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as paid');
    }
  }

  async cancelOrderByTransaction(transactionId: string, reason: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { skipCashTransactionId: transactionId }
      });

      if (!order) {
        throw new RpcException({
          statusCode: 404,
          message: `Order not found for transaction: ${transactionId}`
        });
      }

      order.wcOrderStatus = 'cancelled';
      order.wcPaymentStatus = 'failed';

      await this.orderRepository.save(order);

      await this.sendNotification(
        order.userId,
        'Order Cancelled ❌',
        `Your order (${order.wcOrderId}) has been cancelled due to payment failure.`
      );

      this.logger.log(`Order ${order.id} cancelled: ${reason}`);
      return order;
    } catch (error) {
      throw toRpc(error, 'Failed to cancel order');
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

  async getOrdersByStatus(userId: string, status: string) {
    try {
      const filters: any = { userId };

      if (status === 'complete' || status === 'completed') {
        filters.wcOrderStatus = 'completed';
      } else if (status === 'paid') {
        filters.isPaid = true;
      } else if (status === 'delivered') {
        filters.isDelivered = true;
      } else if (status === 'pending') {
        filters.isPaid = false;
        filters.isDelivered = false;
      }

      return await this.orderRepository.find({
        where: filters,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw toRpc(error, 'Failed to get orders by status');
    }
  }

  async getAllOrders() {
    try {
      return await this.orderRepository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw toRpc(error, 'Failed to get all orders');
    }
  }

}

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Orders microservice error';
  return new RpcException({ statusCode, message });
}
