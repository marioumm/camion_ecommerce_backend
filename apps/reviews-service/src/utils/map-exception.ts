/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RpcException } from '@nestjs/microservices';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

export function mapException(error: any): RpcException {
  if (
    error instanceof NotFoundException ||
    error instanceof ConflictException ||
    error instanceof BadRequestException ||
    error instanceof UnauthorizedException
  ) {
    return new RpcException({
      statusCode: error.getStatus(),
      message: error.message,
    });
  }
  return new RpcException({
    statusCode: 500,
    message: error?.message || 'Unknown error from reviews microservice',
  });
}
