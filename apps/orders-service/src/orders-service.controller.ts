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
          orderId: order.id,
          order,
        }
      };
    } catch (error) {
      throw toRpc(error, 'Failed to create order');
    }
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


  @MessagePattern({ cmd: 'mark_order_paid_by_transaction' })
  async markOrderPaidByTransaction(@Payload() data: { transactionId: string; paymentData: any }) {
    try {
      const order = await this.ordersService.markOrderPaidByTransaction(
        data.transactionId,
        data.paymentData
      );
      return this.mapOrderResponse(order);
    } catch (error) {
      throw toRpc(error, 'Failed to mark order as paid by transaction');
    }
  }

  @MessagePattern({ cmd: 'cancel_order_by_transaction' })
  async cancelOrderByTransaction(@Payload() data: { transactionId: string; reason: string }) {
    try {
      const order = await this.ordersService.cancelOrderByTransaction(
        data.transactionId,
        data.reason
      );
      return this.mapOrderResponse(order);
    } catch (error) {
      throw toRpc(error, 'Failed to cancel order by transaction');
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

  @MessagePattern({ cmd: 'get_orders_by_status' })
  async getOrdersByStatus(@Payload() data: { userId: string; status: string }) {
    try {
      const orders = await this.ordersService.getOrdersByStatus(data.userId, data.status);
      return orders.map((order) => this.mapOrderResponse(order));
    } catch (error) {
      throw toRpc(error, 'Failed to get orders by status');
    }
  }

  @MessagePattern({ cmd: 'get_all_orders' })
  async getAllOrders() {
    try {
      const orders = await this.ordersService.getAllOrders();
      return orders.map((order) => this.mapOrderResponse(order));
    } catch (error) {
      throw toRpc(error, 'Failed to get all orders');
    }
  }


  mapOrderResponse(order: Order) {
    return {
      id: order.id,
      wcOrderId: order.wcOrderId, // ✅ ده اللي محتاجه للـ tracking!
      userId: order.userId,
      wcOrderStatus: order.wcOrderStatus,
      wcPaymentStatus: order.wcPaymentStatus,
      wcOrderKey: order.wcOrderKey,
      total: order.total,
      currency: order.currency,
      items: order.items,
      customer_data: order.customerData,
      payment_method: order.paymentMethod,
      payment_data: order.paymentData,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt,
      skipCashPaymentUrl: order.skipCashPaymentUrl,
      skipCashTransactionId: order.skipCashTransactionId,

      // ✅ معلومات إضافية للفرونت إند
      customerName: `${order.customerData.first_name} ${order.customerData.last_name}`,
      customerEmail: order.customerData.email,
      customerPhone: order.customerData.phone,
      itemsCount: order.items?.length || 0,
      trackingUrl: `/track-order/${order.wcOrderId}`,
      statusDisplay: this.getStatusDisplay(order),
    };
  }

  private getStatusDisplay(order: Order): string {
    if (order.isDelivered) return 'Delivered ✅';
    if (order.isPaid && order.wcOrderStatus === 'completed') return 'Completed 📦';
    if (order.isPaid && order.wcOrderStatus === 'processing') return 'Processing 🔄';
    if (order.isPaid) return 'Paid 💳';
    if (order.wcOrderStatus === 'pending') return 'Pending Payment ⏳';
    if (order.wcOrderStatus === 'cancelled') return 'Cancelled ❌';
    return order.wcOrderStatus || 'Unknown';
  }


}

function toRpc(error: any, fallbackMsg?: string) {
  if (error instanceof RpcException) return error;
  const statusCode = error?.getStatus?.() || 500;
  const message = error?.message || fallbackMsg || 'Orders microservice error';
  return new RpcException({ statusCode, message });
}
