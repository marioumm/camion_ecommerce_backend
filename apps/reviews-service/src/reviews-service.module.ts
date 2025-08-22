import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Review } from './entities/review.entity';
import { ReviewsController } from './reviews-service.controller';
import { ReviewsService } from './reviews-service.service';
import { BuckyDropHttpService } from './shared/buckydrop-http.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Review, Comment]),
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'ORDERS_SERVICE',
        imports: [ConfigModule], 
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('ORDER_SERVICE_HOST'), 
            port: Number(config.get('ORDERS_TCP_PORT')), 
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, BuckyDropHttpService],
  exports: [ReviewsService],
})
export class ReviewsModule { }
