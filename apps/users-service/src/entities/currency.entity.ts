import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 3 })
  code: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 10 })
  symbol: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 6,
    default: 1.000000
  })
  rate: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
