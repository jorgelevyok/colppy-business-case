/** Registers payment methods controller, service, and repository. */
import { PaymentMethod } from '@datasources/colppy/entities/payment_method.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodsController } from './payment.methods.controller';
import { PaymentMethodsService } from './payment.methods.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod], 'COLPPY')],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
