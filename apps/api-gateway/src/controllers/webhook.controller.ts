/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Req, Res, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';

@Controller('orders')
export class WebhookController {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly orderClient: ClientProxy
  ) {}

  private WC_BASE_URL = process.env.WC_BASE_URL;

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

  @Post('skipcash-webhook')
  async handleSkipCashWebhook(@Req() req, @Res() res) {
    const event = req.body;
    console.log('SkipCash Webhook received:', event);

    const { reference, payment_status } = event; 

    if (payment_status === 'Completed' || payment_status === 'Success') {
      await this.orderClient.send(
        { cmd: 'mark_order_paid' },
        reference 
      ).toPromise();
    }

    if (payment_status === 'Failed' || payment_status === 'Cancelled') {
      const cancelRes = await this.cancelWCOrder(reference);
      console.log('Cancelled WC order due to SkipCash failure:', cancelRes?.data);
    }

    return res.json({ received: true });
  }
}
