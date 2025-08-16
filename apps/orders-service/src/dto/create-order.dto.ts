// src/orders/dto/create-order.dto.ts

import { IsArray, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ShippingAddressDto {
  @IsString() first_name: string;
  @IsString() last_name: string;
  @IsString() address_1: string;
  @IsString() address_2: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() postcode: string;
  @IsString() country: string;
}

class CustomerDataDto {
  @IsString() first_name: string;
  @IsString() last_name: string;
  @IsString() email: string;
  @IsString() phone: string;
  @IsString() address_1: string;
  @IsString() address_2: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() postcode: string;
  @IsString() country: string;
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping_address: ShippingAddressDto;
  @IsOptional() shipping_option?: any;
}

class PaymentDataDto {
  @IsString() key: string;
  @IsString() value: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customer_data: CustomerDataDto;

  @IsString()
  payment_method: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDataDto)
  payment_data: PaymentDataDto[];

  @IsOptional()
  @IsString()
  success_url?: string;

  @IsOptional()
  @IsString()
  cancel_url?: string;
}
