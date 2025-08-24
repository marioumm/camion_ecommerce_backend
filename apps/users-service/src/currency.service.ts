/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CurrencyService {
  private readonly FIXER_API_KEY = process.env.FIXER_API_KEY;
  private readonly WOOCOMMERCE_BASE_CURRENCY = 'QAR'; 
  private readonly FIXER_BASE_CURRENCY = 'USD'; 

  constructor(
    @InjectRepository(Currency) private currencyRepo: Repository<Currency>,
    private readonly httpService: HttpService,
  ) {}

  async getAllCurrencies(): Promise<Currency[]> {
    return this.currencyRepo.find({
      where: { isActive: true },
      order: { code: 'ASC' }
    });
  }

  async getCurrencyByCode(code: string): Promise<Currency | null> {
    return this.currencyRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true }
    });
  }

  async convertPrice(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return Number(amount.toFixed(2));

    const currencies = await this.currencyRepo.find({
      where: { 
        code: In([fromCurrency.toUpperCase(), toCurrency.toUpperCase()]),
        isActive: true 
      }
    });

    const fromRate = currencies.find(c => c.code === fromCurrency.toUpperCase())?.rate || 1;
    const toRate = currencies.find(c => c.code === toCurrency.toUpperCase())?.rate || 1;

    const baseAmount = amount / fromRate;
    const convertedAmount = baseAmount * toRate;

    return Number(convertedAmount.toFixed(2));
  }

  @Cron('0 * * * *')
  async updateExchangeRates(): Promise<void> {
    try {
      console.log('🔄 Updating exchange rates from Fixer.io...');
      
      if (!this.FIXER_API_KEY) {
        throw new Error('FIXER_API_KEY is not configured');
      }

      const response = await this.httpService.get(
        `https://api.fixer.io/v1/latest?access_key=${this.FIXER_API_KEY}&base=${this.FIXER_BASE_CURRENCY}`
      ).toPromise();

      const rates = response?.data?.rates;
      if (!rates) {
        throw new Error('Failed to fetch exchange rates from Fixer.io');
      }

      await this.currencyRepo.update(
        { code: this.FIXER_BASE_CURRENCY },
        { rate: 1.0, updatedAt: new Date() }
      );

      for (const [code, rate] of Object.entries(rates)) {
        const updateResult = await this.currencyRepo.update(
          { code: code.toUpperCase() },
          { rate: rate as number, updatedAt: new Date() }
        );
        
        if ((updateResult.affected ?? 0) > 0) {
          console.log(`✅ Updated ${code}: ${rate}`);
        }
      }

      console.log('✅ Exchange rates updated successfully');
    } catch (error) {
      console.error('❌ Failed to update exchange rates:', error.message);
    }
  }

  async convertWooCommerceProducts(products: any[], userCurrency: string): Promise<any[]> {
    if (userCurrency === this.WOOCOMMERCE_BASE_CURRENCY) {
      return products.map(product => ({
        ...product,
        currency: this.WOOCOMMERCE_BASE_CURRENCY,
        currencySymbol: 'ر.ق'
      }));
    }

    const targetCurrency = await this.getCurrencyByCode(userCurrency);
    if (!targetCurrency) {
      throw new Error(`Currency ${userCurrency} is not supported`);
    }

    const convertedProducts: any[] = [];
    
    for (const product of products) {
      const convertedPrice = await this.convertPrice(
        product.price, 
        this.WOOCOMMERCE_BASE_CURRENCY, 
        userCurrency
      );

      let convertedRegularPrice: number | null = null;
      if (product.regular_price) {
        convertedRegularPrice = await this.convertPrice(
          product.regular_price, 
          this.WOOCOMMERCE_BASE_CURRENCY, 
          userCurrency
        );
      }

      let convertedSalePrice: number | null = null;
      if (product.sale_price) {
        convertedSalePrice = await this.convertPrice(
          product.sale_price, 
          this.WOOCOMMERCE_BASE_CURRENCY, 
          userCurrency
        );
      }

      convertedProducts.push({
        ...product,
        price: convertedPrice,
        regular_price: convertedRegularPrice,
        sale_price: convertedSalePrice,
        original_price: product.price,
        original_currency: this.WOOCOMMERCE_BASE_CURRENCY,
        currency: userCurrency,
        currencySymbol: targetCurrency.symbol
      });
    }

    return convertedProducts;
  }
}
