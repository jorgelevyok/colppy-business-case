/** Lists active payment methods for forms and import name resolution. */
import { Controller, Get } from '@nestjs/common';
import { PaymentMethodsService } from './payment.methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  getAll() {
    return this.paymentMethodsService.getAll();
  }
}
