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

/** TypeORM entity for customers referenced by sales and import/manual create flows. */
@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  @IsUUID()
  customer_id_public: string;

  @Column({ type: 'text' })
  @IsString()
  customer_name: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  customer_creation_date?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  customer_updated_date?: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  customer_deleted_date?: Date | null;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  customer_active: boolean;

  @OneToMany(() => Sale, (sale) => sale.customer)
  sales: Sale[];
}
