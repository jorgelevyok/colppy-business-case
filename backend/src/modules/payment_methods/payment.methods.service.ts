/** Read-only access and validation for payment methods on sales/import. */
import { RESPONSES } from '@config/constants';
import { PaymentMethod } from '@datasources/colppy/entities/payment_method.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceError } from '@utils/service.error';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod, 'COLPPY')
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  /** Active methods ordered by name (id + name only). */
  async getAll() {
    return this.paymentMethodRepository.find({
      where: { payment_method_active: true },
      order: { payment_method_name: 'ASC' },
      select: ['payment_method_id', 'payment_method_name'],
    });
  }

  /** Throws NOT_FOUND when the id is missing or inactive. */
  async ensureActiveById(payment_method_id: number) {
    const method = await this.paymentMethodRepository.findOne({
      where: { payment_method_id, payment_method_active: true },
    });

    if (!method) {
      throw new ServiceError(RESPONSES.NOT_FOUND);
    }

    return method;
  }
}
