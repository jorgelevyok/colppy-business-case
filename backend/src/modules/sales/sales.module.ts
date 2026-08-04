/** Nest module wiring sales controller, service, and COLPPY Sale repository. */
import { Sale } from '@datasources/colppy/entities/sale.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { PaymentMethodsModule } from '../payment_methods/payment.methods.module';
import { ProductsModule } from '../products/products.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale], 'COLPPY'),
    CustomersModule,
    ProductsModule,
    PaymentMethodsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
