import { Controller, Get, Query } from '@nestjs/common';
import { TrackingService } from '../services/tracking.service';
import { GetTrackingDto } from '../dtos/orders/get-tracking.dto';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get()
  async getTracking(@Query() query: GetTrackingDto) {
    return this.trackingService.getTrackingByOrderId(query.order_id);
  }
}