import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { OrderRequest } from '../entities/order-request.entity';
import { Order } from '../entities/order.entity';

import { CreateOrderDto } from '../dtos/orders/create-order.dto';
import { UpdateOrderDto } from '../dtos/orders/update-order.dto';
import {
  OrderResponse,
  PaginatedOrderResponse,
} from '../types/order-responses';

import { OrderStatus } from '../enums/order-status.enum';
import { S3UploadService, Image3DMetadata } from './s3-upload.service';
import 'multer'; // Required for Express.Multer.File type

import { OrderRequestRepository } from '../repositories/order-request.repository';
import { OrderRepository } from '../repositories/order.repository';
import { ProductListRepository } from '../repositories/product-list.repository';
import { ProductTypeRepository } from '../repositories/product-type.repository';
import { ProductList } from '../entities/product-list.entity';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRequestRepo: OrderRequestRepository,
    private readonly orderRepo: OrderRepository,
    private readonly productListRepo: ProductListRepository,
    private readonly productTypeRepo: ProductTypeRepository,
    private readonly s3UploadService: S3UploadService,
    private readonly dataSource: DataSource,
  ) { }

  /* ================= CREATE ORDER ================= */
  // Formerly createOrder. Now creating an OrderRequest.
  async createOrder(
    createOrderDto: CreateOrderDto,
    image3dFiles?: Express.Multer.File[],
  ): Promise<OrderRequest> {
    const productType = await this.productTypeRepo.findByProductName(
      createOrderDto.product_type,
    );

    if (!productType || !productType.product_image) {
      throw new BadRequestException(
        `Image not found for product type: ${createOrderDto.product_type}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRequest = this.orderRequestRepo.createOrderRequest({
        patient_id: createOrderDto.patient_id,
        product_list: createOrderDto.product_list,
        product_type: createOrderDto.product_type,
        shade: createOrderDto.shade,
        tooth_numbers: createOrderDto.tooth_numbers,
        priority: createOrderDto.priority,
        status: createOrderDto.status || OrderStatus.PENDING,
        order_date: new Date(createOrderDto.order_date),
        expected_delivery: new Date(createOrderDto.expected_delivery),
        design_notes: createOrderDto.design_notes ?? null,

        // copy image
        image: productType.product_image,
        image_mime_type: 'image/png',

        clinic_id: createOrderDto.clinic_id ?? null,
        address_id: createOrderDto.address_id ?? null,
      });

      // Save order first to get the order_id
      const savedOrderRequest =
        await this.orderRequestRepo.saveOrderRequest(orderRequest, manager);

      // Upload 3D images to S3 if provided
      if (image3dFiles && image3dFiles.length > 0) {
        const metadataPromises = image3dFiles.map((file) =>
          this.s3UploadService.uploadFile(
            file,
            savedOrderRequest.order_id,
            savedOrderRequest.patient_id,
          ),
        );

        const image3dMetadata = await Promise.all(metadataPromises);
        savedOrderRequest.image_3d = image3dMetadata;
        return this.orderRequestRepo.saveOrderRequest(savedOrderRequest, manager);
      }

      // Initialize as empty array if no files
      savedOrderRequest.image_3d = [];
      return this.orderRequestRepo.saveOrderRequest(savedOrderRequest, manager);
    });
  }

  /* ================= UPDATE ORDER ================= */
  // Formerly updateOrder. Now updating OrderRequest.
  async updateOrder(
    orderId: string,
    updateOrderDto: UpdateOrderDto,
    image3dFiles?: Express.Multer.File[],
  ): Promise<OrderRequest> {
    const orderRequest = await this.orderRequestRepo.findById(orderId);

    if (!orderRequest) {
      throw new NotFoundException(`Order request not found with ID ${orderId}`);
    }

    // update product type & image
    if (
      updateOrderDto.product_type &&
      updateOrderDto.product_type !== orderRequest.product_type
    ) {
      const productType = await this.productTypeRepo.findByProductName(
        updateOrderDto.product_type,
      );

      if (!productType || !productType.product_image) {
        throw new BadRequestException(
          `Image not found for product type: ${updateOrderDto.product_type}`,
        );
      }

      orderRequest.product_type = updateOrderDto.product_type;
      orderRequest.image = productType.product_image;
    }

    if (updateOrderDto.product_list)
      orderRequest.product_list = updateOrderDto.product_list;
    if (updateOrderDto.shade) orderRequest.shade = updateOrderDto.shade;
    if (updateOrderDto.tooth_numbers)
      orderRequest.tooth_numbers = updateOrderDto.tooth_numbers;
    if (updateOrderDto.priority)
      orderRequest.priority = updateOrderDto.priority;

    // Set status from DTO or default to PENDING
    if (updateOrderDto.status) {
      orderRequest.status = updateOrderDto.status;
    } else {
      orderRequest.status = OrderStatus.PENDING;
    }

    if (updateOrderDto.order_date)
      orderRequest.order_date = new Date(updateOrderDto.order_date);
    if (updateOrderDto.expected_delivery)
      orderRequest.expected_delivery = new Date(
        updateOrderDto.expected_delivery,
      );
    if (updateOrderDto.design_notes !== undefined)
      orderRequest.design_notes = updateOrderDto.design_notes;

    if (updateOrderDto.clinic_id)
      orderRequest.clinic_id = updateOrderDto.clinic_id;
    if (updateOrderDto.address_id)
      orderRequest.address_id = updateOrderDto.address_id;

    // Handle 3D image updates
    let updatedMetadata: Image3DMetadata[] = orderRequest.image_3d || [];
    let imageMetadataChanged = false;

    const shouldProcessExisting =
      updateOrderDto.existing_image_3d_urls !== undefined;
    const hasNewFiles = image3dFiles && image3dFiles.length > 0;

    if (shouldProcessExisting) {
      imageMetadataChanged = true;
      const existingUrlsToKeep = updateOrderDto.existing_image_3d_urls;
      const nextMetadata: Image3DMetadata[] = [];

      if (orderRequest.image_3d && Array.isArray(orderRequest.image_3d)) {
        for (const meta of orderRequest.image_3d) {
          const isKept = existingUrlsToKeep.some((url) =>
            url.includes(meta.s3_key),
          );

          if (isKept) {
            nextMetadata.push(meta);
          } else {
            try {
              if (meta.s3_key)
                await this.s3UploadService.deleteFile(meta.s3_key);
            } catch (e) {
              console.warn(
                `Failed to delete unreferenced image ${meta.s3_key}`,
                e,
              );
            }
          }
        }
      }
      updatedMetadata = nextMetadata;
    }

    // 2. Upload new 3D images if provided
    if (hasNewFiles) {
      imageMetadataChanged = true;
      const metadataPromises = image3dFiles.map((file) =>
        this.s3UploadService.uploadFile(
          file,
          orderRequest.order_id,
          orderRequest.patient_id,
        ),
      );

      const newMetadata = await Promise.all(metadataPromises);
      updatedMetadata = [...updatedMetadata, ...newMetadata];
    }

    // 3. Update the order object if changes were made to 3D images
    if (imageMetadataChanged) {
      orderRequest.image_3d = updatedMetadata;
    }

    return this.dataSource.transaction(async (manager) => {
      const savedOrderRequest =
        await this.orderRequestRepo.saveOrderRequest(orderRequest, manager);

      // If order is accepted, copy it to orders table (formerly accepted_orders)
      if (savedOrderRequest.status === OrderStatus.ACCEPTED) {
        await this.copyToOrders(savedOrderRequest, manager);
      }

      return savedOrderRequest;
    });
  }

  /* ================= COPY TO ORDERS ================= */
  // Formerly copyToAcceptedOrders.
  private async copyToOrders(orderRequest: OrderRequest, manager?: EntityManager): Promise<Order> {
    // Check if already exists in orders (formerly accepted_orders)
    const existing = await this.orderRepo.findByOrderId(
      orderRequest.order_id,
    );

    if (existing) {
      // Update the existing order with latest data
      existing.patient_id = orderRequest.patient_id;
      existing.address_id = orderRequest.address_id;
      existing.clinic_id = orderRequest.clinic_id;
      existing.product_list = orderRequest.product_list;
      existing.product_type = orderRequest.product_type;
      existing.shade = orderRequest.shade;
      existing.tooth_numbers = orderRequest.tooth_numbers;
      existing.priority = orderRequest.priority;
      existing.status = orderRequest.status;
      existing.order_date = orderRequest.order_date;
      existing.expected_delivery = orderRequest.expected_delivery;
      existing.design_notes = orderRequest.design_notes;
      existing.image = orderRequest.image;
      existing.image_mime_type = orderRequest.image_mime_type;
      existing.image_3d = orderRequest.image_3d;
      existing.comment = orderRequest.comment;
      return this.orderRepo.saveOrder(existing, manager);
    }

    // Create new order entry
    const order = this.orderRepo.createOrder({
      order_id: orderRequest.order_id,
      patient_id: orderRequest.patient_id,
      address_id: orderRequest.address_id,
      clinic_id: orderRequest.clinic_id,
      product_list: orderRequest.product_list,
      product_type: orderRequest.product_type,
      shade: orderRequest.shade,
      tooth_numbers: orderRequest.tooth_numbers,
      priority: orderRequest.priority,
      status: orderRequest.status,
      order_date: orderRequest.order_date,
      expected_delivery: orderRequest.expected_delivery,
      design_notes: orderRequest.design_notes,
      image: orderRequest.image,
      image_mime_type: orderRequest.image_mime_type,
      image_3d: orderRequest.image_3d,
      comment: orderRequest.comment,
    });

    return this.orderRepo.saveOrder(order, manager);
  }

  /* ================= UPDATE ACCEPTED ORDER (tracking/shipment) ================= */
  async updateAcceptedOrder(
    orderId: string,
    updateData: {
      tracking_no?: string;
      shipment_provider?: Order['shipment_provider'];
    },
  ): Promise<Order> {
    const order = await this.orderRepo.findByOrderId(orderId);

    if (!order) {
      throw new NotFoundException(`Order not found for order ID ${orderId}`);
    }

    if (updateData.tracking_no !== undefined)
      order.tracking_no = updateData.tracking_no;
    if (updateData.shipment_provider !== undefined)
      order.shipment_provider = updateData.shipment_provider;

    return this.orderRepo.saveOrder(order);
  }

  /* ================= GET ACCEPTED ORDER BY ORDER ID ================= */
  async getAcceptedOrderByOrderId(orderId: string): Promise<Order | null> {
    return this.orderRepo.findByOrderId(orderId);
  }

  /* ================= ORDERS BY PATIENT ================= */
  async getOrdersByPatientId(
    patientId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedOrderResponse> {
    const skip = (page - 1) * limit;

    const [orders, total] =
      await this.orderRequestRepo.findPaginatedByPatientId(
        patientId,
        skip,
        limit,
      );

    return {
      data: orders.map((o) => ({
        ...o,
        image: o.image ? o.image.toString('base64') : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ================= ORDER BY ID ================= */
  async getOrderById(orderId: string): Promise<OrderResponse | null> {
    const orderRequest = await this.orderRequestRepo.findById(orderId);

    if (!orderRequest) {
      return null;
    }

    // Generate presigned URLs for 3D images if exist
    const image3dUrls: string[] = [];
    if (orderRequest.image_3d && Array.isArray(orderRequest.image_3d)) {
      for (const meta of orderRequest.image_3d) {
        if (meta.s3_key) {
          try {
            const url = await this.s3UploadService.getPresignedUrl(
              meta.s3_key,
              3600, // 1 hour expiry
            );
            image3dUrls.push(url);
          } catch (error) {
            console.warn(
              'Failed to generate presigned URL for 3D image:',
              error,
            );
          }
        }
      }
    } else if (orderRequest.image_3d && (orderRequest.image_3d as any).s3_key) {
      // Handle legacy single object case
      try {
        const url = await this.s3UploadService.getPresignedUrl(
          (orderRequest.image_3d as any).s3_key,
          3600,
        );
        image3dUrls.push(url);
      } catch (error) {
        console.warn(
          'Failed to generate presigned URL for legacy 3D image:',
          error,
        );
      }
    }

    return {
      ...orderRequest,
      image: orderRequest.image?.toString('base64') ?? null,
      image_3d_urls: image3dUrls,
    };
  }

  /* ================= PRODUCT LIST ================= */
  async getProductList(): Promise<Partial<ProductList>[]> {
    return this.productListRepo.findAllSorted();
  }

  /* ================= PRODUCT TYPES ================= */
  async getProductTypesByListName(
    listName: string,
  ): Promise<{ product_id: string; product_name: string }[]> {
    return this.productTypeRepo.findTypesByListName(listName);
  }

  /* ================= PRODUCT IMAGE ================= */
  async getProductImage(
    listName: string,
    typeName: string,
  ): Promise<string | null> {
    const result = await this.productTypeRepo.findProductImage(
      listName,
      typeName,
    );

    return result?.product_image
      ? result.product_image.toString('base64')
      : null;
  }
}
