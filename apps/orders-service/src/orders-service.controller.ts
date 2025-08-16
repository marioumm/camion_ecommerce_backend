/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders-service.service';
import { CartItem } from 'apps/cart-service/src/entities/cart.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller()
@UsePipes(
  new ValidationPipe({
    exceptionFactory: (errors) =>
      new RpcException({
        statusCode: 400,
        message: 'Validation failed',
        details: errors,
      }),
  }),
)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
  ) { }

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: { userId: string } & CreateOrderDto) {
    try {
      const { userId, ...dto } = data;
      const items = await this.cartRepository.find({ where: { userId } });
      if (!items || !items.length) throw toRpc('Cart is empty');

      const order = await this.ordersService.createOrder(userId, items, dto as CreateOrderDto);

      return {
        status: 200,
        message: 'Order created. Please complete payment.',
        data: {
          sessionId: order.stripeSessionId,
          stripeCheckoutUrl: order.stripeCheckoutUrl,
          orderId: order.id,
          order,
        }
      };
    } catch (error) {
      throw toRpc(error, 'Failed to create order');
    }
  }


  @MessagePattern({ cmd: 'mark_order_paid_by_session_id' })
  async markOrderPaid(@Payload() data: { sessionId: string }) {
    await this.ordersService.markOrderPaidBySessionId(data.sessionId);
  }



  @MessagePattern({ cmd: 'get_order_by_id' })
  async getOrder(@Payload() id: string) {
    try {
      const order = await this.ordersService.getOrderById(id);
      return this.mapOrderResponse(order);
    } catch (error) {
      throw toRpc(error, 'Failed to get order by id');
    }
  }

  @MessagePattern({ cmd: 'get_orders_by_user' })
  async getOrdersByUser(@Payload() data: { userId: string }) {
    try {
      const orders = await this.ordersService.getOrdersByUser(data.userId);
      return orders.map((order) => this.mapOrderResponse(order));
    } catch (error) {
      throw toRpc(error, 'Failed to get orders by user');
    }
  }

  @MessagePattern({ cmd: 'mark_order_paid' })
  async markAsPaid(@Payload() id: string) {
    try {
      const order = await this.ordersService.markAsPaid(id);
      if (!order)
        throw new RpcException({ statusCode: 404, message: 'Order not found' });
      return this.mapOrderResponse(order);
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as paid');
    }
  }

  @MessagePattern({ cmd: 'mark_order_delivered' })
  async markAsDelivered(@Payload() id: string) {
    try {
      const order = await this.ordersService.markAsDelivered(id);
      if (!order)
        throw new RpcException({ statusCode: 404, message: 'Order not found' });
      return this.mapOrderResponse(order);
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as delivered');
    }
  }

  @MessagePattern({ cmd: 'delete_order' })
  async deleteOrder(@Payload() id: string) {
    try {
      const result = await this.ordersService.deleteOrder(id);
      if (!result.affected)
        throw new RpcException({ statusCode: 404, message: 'Order not found' });
      return { message: 'Order deleted successfully.' };
    } catch (error) {
      throw toRpc(error, 'Failed to delete order');
    }
  }

  mapOrderResponse(order: Order) {
    return {
      id: order.id,
      items: order.items,
      customer_data: order.customerData,
      payment_method: order.paymentMethod,
      payment_data: order.paymentData,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
    };
  }
}

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Orders microservice error';
  return new RpcException({ statusCode, message });
}
