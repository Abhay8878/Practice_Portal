import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDateString,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderPriority } from '../../enums/order-priority.enum';
import { OrderStatus } from '../../enums/order-status.enum';

export class CreateOrderDto {
  @IsUUID()
  patient_id: string;

  @IsNumber()
  @IsOptional()
  address_id?: number | null;

  @IsUUID()
  @IsOptional()
  clinic_id?: string | null;

  @IsString()
  product_list: string;

  @IsString()
  product_type: string;

  @IsString()
  @IsOptional()
  shade: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') return [Number(value)];
    if (Array.isArray(value)) return value.map(Number);
    return value;
  })
  @IsArray()
  tooth_numbers: number[];

  @IsEnum(OrderPriority)
  priority: OrderPriority;

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsDateString()
  order_date: string;

  @IsDateString()
  expected_delivery: string;

  @IsString()
  @IsOptional()
  @MaxLength(300, { message: 'Design notes cannot exceed 300 characters' })
  design_notes?: string;

  @IsOptional()
  image?: Buffer | string; // Handled via file upload typically
}
