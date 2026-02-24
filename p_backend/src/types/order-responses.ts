import { OrderRequest } from '../entities/order-request.entity';

export interface OrderResponse extends Omit<OrderRequest, 'image'> {
  image: string | null;
  image_3d_urls?: string[]; // Presigned URLs for 3D images
}

export interface PaginatedOrderResponse {
  data: OrderResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
