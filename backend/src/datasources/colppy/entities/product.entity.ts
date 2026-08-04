import { IsBoolean, IsString, IsUUID } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

/** TypeORM entity for products referenced by sales. */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  @IsUUID()
  product_id_public: string;

  @Column({ type: 'text' })
  @IsString()
  product_name: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  product_creation_date?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  product_updated_date?: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  product_deleted_date?: Date | null;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  product_active: boolean;

  @OneToMany(() => Sale, (sale) => sale.product)
  sales: Sale[];
}
