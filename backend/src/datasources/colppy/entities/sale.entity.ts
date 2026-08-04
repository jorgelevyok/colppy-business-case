import { IsInt, IsNumber, IsString, IsUUID } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { PaymentMethod } from './payment_method.entity';
import { Product } from './product.entity';

/** TypeORM entity mapping the `sales` table and relations to customer, product, payment method. */
@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  sale_id: number;

  @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  @IsUUID()
  sale_id_public: string;

  @Column({ type: 'text', unique: true, nullable: true })
  @IsString()
  sale_code?: string;

  @Column({ type: 'date' })
  sale_date: string;

  @Column({ type: 'int' })
  customer_id: number;

  @ManyToOne(() => Customer, (customer) => customer.sales, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, (product) => product.sales, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  payment_method_id: number;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.sales, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_method_id' })
  payment_method: PaymentMethod;

  @Column({ type: 'int' })
  @IsInt()
  sale_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @IsNumber()
  sale_amount: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  sale_creation_date?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  sale_updated_date?: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  sale_deleted_date?: Date | null;
}
