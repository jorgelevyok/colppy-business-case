/** Wires importer HTTP layer, service, and sales import strategy. */
import { Sale } from '@datasources/colppy/entities/sale.entity';
import { CustomersModule } from '@modules/customers/customers.module';
import { PaymentMethodsModule } from '@modules/payment_methods/payment.methods.module';
import { ProductsModule } from '@modules/products/products.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImporterController } from './importer.controller';
import { ImporterService } from './importer.service';
import { SalesImportStrategy } from './strategies/sales.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale], 'COLPPY'),
    CustomersModule,
    ProductsModule,
    PaymentMethodsModule,
  ],
  controllers: [ImporterController],
  providers: [ImporterService, SalesImportStrategy],
})
export class ImporterModule {}
