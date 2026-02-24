import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrderPriority } from '../enums/order-priority.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { ShipmentProvider } from '../enums/shipment-provider.enum';

@Entity({ name: 'orders' })
@Index('idx_orders_patient_id', ['patient_id'])
@Index('idx_orders_order_date', ['order_date'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  accepted_order_id: string;

  // Reference to the original order in the orders table
  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'int', nullable: true })
  address_id: number | null;

  @Column({ type: 'uuid', nullable: true })
  clinic_id: string | null;

  @Column({ type: 'varchar', length: 100 })
  product_list: string;

  @Column({ type: 'varchar', length: 255 })
  product_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shade: string;

  @Column({ type: 'int', array: true })
  tooth_numbers: number[];

  @Column({
    type: 'enum',
    enum: OrderPriority,
  })
  priority: OrderPriority;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ACCEPTED,
  })
  status: OrderStatus;

  @Column({ type: 'timestamptz' })
  order_date: Date;

  @Column({ type: 'timestamptz' })
  expected_delivery: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  design_notes?: string;

  @Column({ type: 'bytea', nullable: true })
  image?: Buffer;

  @Column({ type: 'varchar', nullable: true })
  image_mime_type?: string;

  // 3D image metadata stored in S3
  @Column({ type: 'jsonb', nullable: true })
  image_3d:
    | {
        s3_key: string;
        s3_bucket: string;
        file_name: string;
        file_size: number;
        content_type: string;
        order_id: string;
        patient_id: string;
        uploaded_at: string;
      }[]
    | null;

  // Comments
  @Column({ type: 'varchar', length: 1000, nullable: true })
  comment: string;

  // Shipment tracking
  @Column({ type: 'varchar', length: 255, nullable: true })
  tracking_no: string;

  @Column({
    type: 'enum',
    enum: ShipmentProvider,
    nullable: true,
  })
  shipment_provider: ShipmentProvider;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
