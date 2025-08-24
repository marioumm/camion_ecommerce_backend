/* eslint-disable @typescript-eslint/require-await */
import { JwtAuthGuard } from '@app/auth';
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUserId } from 'libs/auth/src/current-user.decorator';

@Controller('currency')
@UseGuards(JwtAuthGuard)
export class CurrencyController {
  constructor(
    @Inject('USERS_SERVICE') private userService: ClientProxy,
  ) {}

  @Get('list')
  async getCurrencies() {
    return this.userService.send('get_currencies', {});
  }

 @Post('convert-products')
  async convertProducts(
    @CurrentUserId() userId: string, 
    @Body() data: {
      products: any[];
      fromCurrency?: string;
    }
  ) {
    return this.userService.send('convert_products_currency', {
      userId, 
      products: data.products,
      fromCurrency: data.fromCurrency,
    });
  }

  @Post('convert-price') 
  async convertPrice(
    @CurrentUserId() userId: string, 
    @Body() data: {
      amount: number;
      fromCurrency?: string;
    }
  ) {
    return this.userService.send('convert_single_price', {
      userId, 
      amount: data.amount,
      fromCurrency: data.fromCurrency,
    });
  }
}


