import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Comment } from './comment.entity';

@Entity('reviews')
@Index(['woocommerceProductId'])
@Index(['userId', 'woocommerceProductId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  woocommerceProductId: number;

  @Column()
  orderId: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productSlug: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ default: true })
  isVerifiedPurchase: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.review, { cascade: true })
  comments: Comment[];
}
