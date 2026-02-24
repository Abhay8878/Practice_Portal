import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  Patch,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import 'multer'; // Required for Express.Multer.File type

import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dtos/orders/create-order.dto';
import { UpdateOrderDto } from '../dtos/orders/update-order.dto';
import { PatientOrdersQueryDto } from '../dtos/orders/patient-orders-query.dto';
import { OrderRequest } from '../entities/order-request.entity';
import { Order } from '../entities/order.entity';
import { ProductList } from '../entities/product-list.entity';
import { PaginatedOrderResponse } from '../types/order-responses';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /* ---------- CREATE ORDER ---------- */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'image_3d', maxCount: 4 },
    ]),
  )
  async createOrder(
    @Body() dto: CreateOrderDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; image_3d?: Express.Multer.File[] },
  ): Promise<OrderRequest> {
    console.log(dto);
    const image3dFiles = files?.image_3d;
    return this.ordersService.createOrder(dto, image3dFiles);
  }

  /* ---------- UPDATE ORDER ---------- */
  @Patch(':orderId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'image_3d', maxCount: 4 },
    ]),
  )
  async updateOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; image_3d?: Express.Multer.File[] },
  ): Promise<OrderRequest> {
    const image3dFiles = files?.image_3d;
    return this.ordersService.updateOrder(orderId, dto, image3dFiles);
  }

  /* ---------- PRODUCT LIST ---------- */
  @Get('product-list')
  async getProductList(): Promise<Partial<ProductList>[]> {
    return this.ordersService.getProductList();
  }

  /* ---------- PRODUCT TYPE ---------- */
  @Get('product-type')
  async getProductType(
    @Query('listName') listName: string,
  ): Promise<{ product_id: string; product_name: string }[]> {
    if (!listName) {
      throw new BadRequestException('listName is required');
    }

    return this.ordersService.getProductTypesByListName(listName);
  }

  /* ---------- PRODUCT IMAGE ---------- */
  @Get('product-image')
  async getProductImage(
    @Query('listName') listName: string,
    @Query('typeName') typeName: string,
  ): Promise<string | null> {
    if (!listName || !typeName) {
      throw new BadRequestException('listName and typeName are required');
    }

    return this.ordersService.getProductImage(listName, typeName);
  }

  /* ---------- ORDERS BY PATIENT ---------- */
  @Get('patient/:patientId')
  async getOrdersByPatientId(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query() query: PatientOrdersQueryDto,
  ): Promise<PaginatedOrderResponse> {
    return this.ordersService.getOrdersByPatientId(
      patientId,
      query.page,
      query.limit,
    );
  }

  /* ---------- GET ACCEPTED ORDER ---------- */
  @Get('accepted/:orderId')
  async getAcceptedOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<Order> {
    const acceptedOrder =
      await this.ordersService.getAcceptedOrderByOrderId(orderId);

    if (!acceptedOrder) {
      throw new NotFoundException('Accepted order not found');
    }

    return acceptedOrder;
  }

  /* ---------- UPDATE ACCEPTED ORDER (tracking/shipment) ---------- */
  @Patch('accepted/:orderId')
  async updateAcceptedOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body()
    body: {
      tracking_no?: string;
      shipment_provider?: Order['shipment_provider'];
    },
  ): Promise<Order> {
    return this.ordersService.updateAcceptedOrder(orderId, body);
  }

  /* ---------- ORDER BY ID (KEEP LAST) ---------- */
  @Get(':orderId')
  async getOrderById(@Param('orderId', new ParseUUIDPipe()) orderId: string) {
    const order = await this.ordersService.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
