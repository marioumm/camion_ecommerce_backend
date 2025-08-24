/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// apps/users-service/src/database/currency.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../entities/currency.entity';

@Injectable()
export class CurrencySeeder {
  constructor(
    @InjectRepository(Currency)
    private currencyRepo: Repository<Currency>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting currency seeding...');

    await this.createTable();

    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000 },
      { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.8500 },
      { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.7300 },
      { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', rate: 3.6400 },
      { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', rate: 3.7500 },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.6700 },
      { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', rate: 30.9000 },
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 27.0000 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.0000 },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.2500 },
    ];

    let addedCount = 0;
    for (const currencyData of currencies) {
      const exists = await this.currencyRepo.findOne({
        where: { code: currencyData.code }
      });

      if (!exists) {
        const currency = this.currencyRepo.create({
          ...currencyData,
          isActive: true,
        });
        await this.currencyRepo.save(currency);
        console.log(`✅ Added: ${currencyData.code} - ${currencyData.name}`);
        addedCount++;
      } else {
        console.log(`⏭️ Currency ${currencyData.code} already exists`);
      }
    }

    console.log(`🎉 Seeding completed! Added ${addedCount} new currencies`);
  }

  private async createTable(): Promise<void> {
    try {
      await this.currencyRepo.query(`
        CREATE TABLE IF NOT EXISTS currencies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(3) UNIQUE NOT NULL,
          name VARCHAR(50) NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          rate DECIMAL(10,6) DEFAULT 1,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.currencyRepo.query(`
        CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code)
      `);
      await this.currencyRepo.query(`
        CREATE INDEX IF NOT EXISTS idx_currencies_active ON currencies(is_active)
      `);

      await this.currencyRepo.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD',
        ADD COLUMN IF NOT EXISTS preferred_locale VARCHAR(5) DEFAULT 'en'
      `);

      console.log('📊 Database schema ready!');
    } catch (error) {
      console.log('Schema already exists:', error.message);
    }
  }
}
