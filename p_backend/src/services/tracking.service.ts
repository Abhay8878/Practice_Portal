import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { mapFedexTrackingResponse } from './tracking.mapper';

import { OrderRepository } from '../repositories/order.repository';

@Injectable()
export class TrackingService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly httpService: HttpService,
  ) { }

  // 🔑 Get FedEx OAuth Token
  private async getFedexToken(): Promise<string> {
    const url = `${process.env.FEDEX_BASE_URL}/oauth/token`;

    const response = await firstValueFrom(
      this.httpService.post(
        url,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.FEDEX_CLIENT_ID,
          client_secret: process.env.FEDEX_CLIENT_SECRET,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return response.data.access_token;
  }

  // Main method
  async getTrackingByOrderId(orderId: string) {
    const order = await this.orderRepo.findByOrderIdWithTracking(orderId);

    if (!order) throw new NotFoundException('Order not found');
    if (!order.tracking_no)
      throw new NotFoundException('Tracking number not available');

    //
    const token = await this.getFedexToken();

    // 
    const trackingResponse = await firstValueFrom(
      this.httpService.post(
        `${process.env.FEDEX_BASE_URL}/track/v1/trackingnumbers`,
        {
          trackingInfo: [
            {
              trackingNumberInfo: {
                trackingNumber: order.tracking_no,
              },
            },
          ],
          includeDetailedScans: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    const mappedData = mapFedexTrackingResponse(trackingResponse.data);

    // STEP 16: map FedEx response
    return {
      success: true,
      data: mappedData,
    };
  }
}
