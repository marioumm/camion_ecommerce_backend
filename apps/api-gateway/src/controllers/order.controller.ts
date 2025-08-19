import { JwtAuthGuard } from '@app/auth';
import { Controller, Post, Get, Param, Body, UseGuards, Inject, Delete, Patch } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from 'apps/orders-service/src/dto/create-order.dto';
import { UserRole } from 'apps/users-service/src/entities/user.entity';
import { CurrentUserId } from 'libs/auth/src/current-user.decorator';
import { Roles } from 'libs/auth/src/roles.decorator';


@Controller('checkout')
export class OrdersController {
  constructor(@Inject('ORDERS_SERVICE')
  private readonly orderClient: ClientProxy) { }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.USER)
  @Post('/complete')
  createOrder(@Body() dto: CreateOrderDto, @CurrentUserId() userId: string) {
    return this.orderClient.send({ cmd: 'create_order' }, { ...dto, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Get('/:id')
  getOrder(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'get_order_by_id' }, id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Get('/user/:userId')
  getOrdersByUser(@Param('userId') userId: string) {
    return this.orderClient.send({ cmd: 'get_orders_by_user' }, { userId });
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Patch('/:id/paid')
  markOrderPaid(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'mark_order_paid' }, id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Patch('/:id/delivered')
  markOrderDelivered(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'mark_order_delivered' }, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  deleteOrder(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'delete_order' }, id);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard)
  getOrdersByStatus(
    @CurrentUserId() userId: string,
    @Param('status') status: string
  ) {
    return this.orderClient.send(
      { cmd: 'get_orders_by_status' },
      { userId, status }
    );
  }

}
