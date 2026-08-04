/**
 * Sales business logic: grid queries via TableBack, create/update with related entities.
 */
import { RESPONSES } from '@config/constants';
import { QueryParamsDTO } from '@common/dto/common.dto';
import { Sale } from '@datasources/colppy/entities/sale.entity';
import { TableBack } from '@datasources/datasource.table.back';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceError } from '@utils/service.error';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { PaymentMethodsService } from '../payment_methods/payment.methods.service';
import { ProductsService } from '../products/products.service';
import { PostSaleBodyDTO, PutSaleBodyDTO } from './dto/sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale, 'COLPPY')
    private readonly saleRepository: Repository<Sale>,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  /** Returns sales rows for the frontend grid with joined relations. */
  async findForTableBack(query: QueryParamsDTO) {
    const tableBack = new TableBack(query);

    const baseFields = [
      'sales.sale_id',
      'sales.sale_id_public',
      'sales.sale_code',
      'sales.sale_date',
      'sales.customer_id',
      'sales.product_id',
      'sales.payment_method_id',
      'sales.sale_quantity',
      'sales.sale_amount',
      'sales.sale_creation_date',
      'sales.sale_updated_date',
      'sales.sale_deleted_date',
      'customer.customer_id',
      'customer.customer_id_public',
      'customer.customer_name',
      'product.product_id',
      'product.product_id_public',
      'product.product_name',
      'payment_method.payment_method_id',
      'payment_method.payment_method_id_public',
      'payment_method.payment_method_name',
    ];

    const addAttribute = tableBack.getAddAttribute();
    const selectFields = [...baseFields, ...addAttribute];

    const queryBuilder = this.saleRepository
      .createQueryBuilder('sales')
      .withDeleted()
      .leftJoinAndSelect('sales.customer', 'customer')
      .leftJoinAndSelect('sales.product', 'product')
      .leftJoinAndSelect('sales.payment_method', 'payment_method')
      .select(selectFields);

    return tableBack.filterQuery(queryBuilder);
  }

  /** Creates a sale; resolves customer/product by name and validates payment method id. */
  async create(body: PostSaleBodyDTO) {
    const customer = await this.customersService.findOrCreateByName(
      body.customer_name,
    );
    const product = await this.productsService.findOrCreateByName(
      body.product_name,
    );
    await this.paymentMethodsService.ensureActiveById(body.payment_method_id);

    const sale = this.saleRepository.create({
      sale_date: body.sale_date,
      customer_id: customer.customer_id,
      product_id: product.product_id,
      payment_method_id: body.payment_method_id,
      sale_quantity: body.sale_quantity,
      sale_amount: String(body.sale_amount),
    });

    const saved = await this.saleRepository.save(sale);
    return this.findOneByIdPublic(saved.sale_id_public);
  }

  /** Partial update by public UUID; throws NOT_FOUND when missing. */
  async update(sale_id_public: string, body: PutSaleBodyDTO) {
    const sale = await this.saleRepository.findOne({
      where: { sale_id_public },
    });

    if (!sale) {
      throw new ServiceError(RESPONSES.NOT_FOUND);
    }

    if (body.customer_name !== undefined) {
      const customer = await this.customersService.findOrCreateByName(
        body.customer_name,
      );
      sale.customer_id = customer.customer_id;
    }

    if (body.product_name !== undefined) {
      const product = await this.productsService.findOrCreateByName(
        body.product_name,
      );
      sale.product_id = product.product_id;
    }

    if (body.payment_method_id !== undefined) {
      await this.paymentMethodsService.ensureActiveById(body.payment_method_id);
      sale.payment_method_id = body.payment_method_id;
    }

    if (body.sale_date !== undefined) {
      sale.sale_date = body.sale_date;
    }

    if (body.sale_quantity !== undefined) {
      sale.sale_quantity = body.sale_quantity;
    }

    if (body.sale_amount !== undefined) {
      sale.sale_amount = String(body.sale_amount);
    }

    await this.saleRepository.save(sale);
    return this.findOneByIdPublic(sale_id_public);
  }

  /** Loads one sale with relations for API responses. */
  private async findOneByIdPublic(sale_id_public: string) {
    const sale = await this.saleRepository.findOne({
      where: { sale_id_public },
      relations: ['customer', 'product', 'payment_method'],
    });

    if (!sale) {
      throw new ServiceError(RESPONSES.NOT_FOUND);
    }

    return sale;
  }
}
