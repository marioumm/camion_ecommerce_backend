/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users-service.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyDto } from './dto/verifyOTP.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UserRole } from './entities/user.entity';
import { CurrencyService } from './currency.service';
import { CurrencySeeder } from './database/currency.seeder';

function mapException(error: any) {
  if (error instanceof RpcException) return error;
  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException ||
    error instanceof UnauthorizedException ||
    error instanceof ConflictException
  ) {
    return new RpcException({
      statusCode: error.getStatus(),
      message: error.message,
    });
  }
  return new RpcException({
    statusCode: 500,
    message: error?.message || 'Unknown error from users microservice',
  });
}

@UsePipes(
  new ValidationPipe({
    exceptionFactory: (errors) =>
      new RpcException({
        statusCode: 400,
        message: 'Validation failed',
        details: errors,
      }),
  }),
)
@Controller()
export class UsersServiceController {
  constructor(private readonly usersService: UsersService,
    private readonly currencyService: CurrencyService,
    private readonly currencySeeder: CurrencySeeder
  ) { }

  @MessagePattern({ cmd: 'register_user' })
  async register(@Payload() dto: RegisterDto) {
    try {
      return await this.usersService.register(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'login_user' })
  async login(@Payload() dto: LoginDto) {
    try {
      return await this.usersService.login(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'login_admin' })
  async loginAdmin(@Payload() dto: LoginAdminDto) {
    try {
      return await this.usersService.loginAdmin(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() dto: CreateUserDto) {
    try {
      return await this.usersService.createUser(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'verify_user' })
  async verifyOTP(@Payload() dto: VerifyDto) {
    try {
      return await this.usersService.verifyOTP(dto);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_users' })
  async getAllUsers() {
    try {
      return await this.usersService.getUsers();
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() id: string) {
    try {
      return await this.usersService.getUserById(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'users.getUserById' })
  async handleGetUserById(@Payload() { id }: { id: string }) {
    try {
      return await this.usersService.getUserById(id);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'find_user_by_identifier' })
  async findUsersByFilters(@Payload() filters: FilterUsersDto) {
    try {
      return await this.usersService.findUsersByFilters(filters);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() payload: { id: string; updateData: UpdateUserDto }) {
    try {
      const { id, updateData } = payload;
      return await this.usersService.updateUser(id, updateData);
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'update-user-role' })
  async updateUserRole(data: { userId: string; role: UserRole }) {
    return this.usersService.updateUserRole(data.userId, data.role);
  }

  @MessagePattern({ cmd: 'approve-affiliate' })
  async handleApproveAffiliate(@Payload() data: { userId: string; role: UserRole }) {
    return this.usersService.approveAffiliateAndGenerateToken(data.userId, data.role);
  }

  @MessagePattern({ cmd: 'generate-token' })
  async handleGenerateToken(@Payload() data: { userId: string }) {
    return this.usersService.generateTokenForUser(data.userId);
  }

  @MessagePattern({ cmd: 'save_notification_token' })
  async saveNotificationToken(
    @Payload() data: { userId: string; token: string }
  ) {
    return this.usersService.saveNotificationToken(data.userId, data.token);
  }

  @MessagePattern({ cmd: 'get-user-device-token' })
  async getUserDeviceToken(@Payload() payload: { userId: string }) {
    return this.usersService.getUserDeviceToken(payload.userId);
  }


  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(@Payload() id: string) {
    try {
      await this.usersService.deleteUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw mapException(error);
    }
  }

  @MessagePattern({ cmd: 'updateUserAddress' })
  async updateUserAddress(@Payload() data: { userId: string; addressDto: any }) {
    try {
      const { userId, addressDto } = data;
      return await this.usersService.updateUserAddress(userId, addressDto);
    } catch (error) {
      throw mapException(error);
    }
  }


  @MessagePattern({ cmd: 'getUserAddress' })
  async getUserAddress(@Payload() userId: string) {
    return this.usersService.getUserAddress(userId);
  }


  @MessagePattern({ cmd: 'update_user_currency' })
  async updateUserCurrency(data: { userId: string; currency: string }) {
    return await this.usersService.updateUserCurrency(data.userId, data.currency);
  }

  @MessagePattern('get_user_preferences')
  async getUserPreferences(data: { userId: string }) {
    return await this.usersService.getUserWithPreferences(data.userId);
  }


  @MessagePattern('get_currencies')
  async getCurrencies() {
    return await this.currencyService.getAllCurrencies();
  }

  @MessagePattern('convert_products_currency')
  async convertProductsCurrency(data: {
    userId: string;
    products: any[];
    fromCurrency?: string;
  }) {
    const { userId, products } = data;

    const user = await this.usersService.getUserWithPreferences(userId);
    const userCurrency = user.preferredCurrency || 'QAR';

    return await this.currencyService.convertWooCommerceProducts(products, userCurrency);
  }

  @MessagePattern('convert_single_price')
  async convertSinglePrice(data: {
    userId: string;
    amount: number;
    fromCurrency?: string;
  }) {
    const { userId, amount, fromCurrency = 'QAR' } = data;

    const user = await this.usersService.getUserWithPreferences(userId);
    const userCurrency = user.preferredCurrency || 'QAR';

    const convertedAmount = await this.currencyService.convertPrice(
      amount,
      fromCurrency,
      userCurrency
    );

    const currency = await this.currencyService.getCurrencyByCode(userCurrency);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      currency: userCurrency,
      currencySymbol: currency?.symbol || userCurrency
    };
  }

  @MessagePattern('update_exchange_rates')
  async updateExchangeRates() {
    return await this.currencyService.updateExchangeRates();
  }

  @MessagePattern('seed_currencies')
  async seedCurrencies() {
    try {
      await this.currencySeeder.seed();
      return { success: true, message: 'Currency seeding completed successfully!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @MessagePattern({ cmd: 'count_all_users' })
  async countAllUsers() {
    return await this.usersService.countAllUsers();
  }

  @MessagePattern({ cmd: 'count_active_users' })
  async countActiveUsers() {
    return await this.usersService.countActiveUsers();
  }
}





