import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductList } from './product-list.entity';
@Entity({ name: 'product_type' })
export class ProductType {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column()
  list_id: number;

  @Column({ type: 'bytea', nullable: true })
  product_image?: Buffer;
  /* OPTIONAL RELATION (SAFE, does not affect anything) */
  @ManyToOne(() => ProductList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'list_id' })
  product_list: ProductList;
}
