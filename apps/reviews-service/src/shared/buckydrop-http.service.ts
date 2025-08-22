/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios';
import { Injectable,  Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BuckyDropHttpService {
  private readonly logger = new Logger(BuckyDropHttpService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const baseUrl = this.configService.get<string>('WC_BASE_URL');
    if (!baseUrl) {
      throw new Error('WC_BASE_URL is not defined in environment variables');
    }
    this.baseUrl = baseUrl;
  }

  async getProduct(productId: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/products/${productId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching product ${productId}:`, error.message);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
