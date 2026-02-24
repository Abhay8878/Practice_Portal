import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RegistrationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface RegistrationAddress {
  addressType?: string;
  country: string;
  state: string;
  city: string;
  zip?: string;
  zipCode?: string;
  street?: string;
  house_no?: string;
}

@Entity('pending_registrations')
export class PendingRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middleName: string | null;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  specialization: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  practitionerType: string | null;

  @Column({ type: 'jsonb', nullable: true })
  addresses: RegistrationAddress[];

  @Column({
    type: 'varchar',
    length: 20,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
