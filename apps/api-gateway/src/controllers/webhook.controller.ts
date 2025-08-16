/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Req, Res, Headers, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


@Controller('orders')
export class WebhookController {
  constructor(@Inject('ORDERS_SERVICE') private readonly orderClient: ClientProxy) { }
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
  @Post('stripe-webhook')
  async handleStripeWebhook(@Req() req, @Res() res, @Headers('stripe-signature') sig: string) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("Webhook!");

    const session = event.data.object;
    console.log(event.type);

    if (event.type === 'checkout.session.completed') {
      await this.orderClient.send(
        { cmd: 'mark_order_paid_by_session_id' },
        { sessionId: session.id }
      ).toPromise();
    }
    if (
      event.type === 'checkout.session.expired' ||
      event.type === 'payment_intent.payment_failed'
    ) {
      if (session.metadata?.wcOrderId) {
        const cancelRes = await this.cancelWCOrder(session.metadata.wcOrderId);
        console.log(
          'Cancelled WC order due to Stripe failure:',
          cancelRes?.data
        );
      }
    }
    return res.json({ received: true });
  }
}
