import { IsUUID } from 'class-validator';

export class GetTrackingDto {
  @IsUUID('4', { message: 'order_id must be a valid UUID' })
  order_id: string;
}