// src/orders/entities/order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wcOrderId: string;

  @Column()
  wcOrderKey: string;

  @Column()
  wcOrderStatus: string;

  @Column()
  wcPaymentStatus: string;

  @Column()
  currency: string;

  @Column()
  total: string;

  @Column()
  userId: string;

  @Column({ type: 'jsonb', nullable: false })
  items: any;

  @Column({ type: 'jsonb', nullable: false })
  customerData: any;

  @Column({ type: 'varchar', nullable: false })
  paymentMethod: string;

  @Column({ type: 'jsonb', nullable: false, default: () => "'[]'" })
  paymentData: any;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ nullable: true })
  stripeSessionId: string;

  @Column({ nullable: true })
  stripeCheckoutUrl: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
