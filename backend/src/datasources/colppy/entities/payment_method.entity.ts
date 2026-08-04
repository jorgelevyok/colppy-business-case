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

/** TypeORM entity for payment methods (seeded; matched by name on CSV import). */
@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  payment_method_id: number;

  @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  @IsUUID()
  payment_method_id_public: string;

  @Column({ type: 'text' })
  @IsString()
  payment_method_name: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  payment_method_creation_date?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  payment_method_updated_date?: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  payment_method_deleted_date?: Date | null;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  payment_method_active: boolean;

  @OneToMany(() => Sale, (sale) => sale.payment_method)
  sales: Sale[];
}
