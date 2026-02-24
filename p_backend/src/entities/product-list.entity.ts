import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'product_list' })
export class ProductList {
  @PrimaryGeneratedColumn()
  list_id: number;

  @Column({ type: 'varchar', length: 255 })
  list_name: string;
}
