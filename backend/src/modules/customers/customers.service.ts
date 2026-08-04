/**
 * Customer lookups for grids and upsert-by-name used by sales and import.
 */
import { QueryParamsDTO } from '@common/dto/common.dto';
import { Customer } from '@datasources/colppy/entities/customer.entity';
import {
  TableBack,
  tableBackFiltersIncludeAttribute,
} from '@datasources/datasource.table.back';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer, 'COLPPY')
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /** TableBack listing; defaults to active customers unless filters override. */
  async findForTableBack(query: QueryParamsDTO) {
    const tableBack = new TableBack(query);

    const baseFields = [
      'customers.customer_id',
      'customers.customer_id_public',
      'customers.customer_name',
      'customers.customer_creation_date',
      'customers.customer_updated_date',
      'customers.customer_deleted_date',
      'customers.customer_active',
    ];

    const addAttribute = tableBack.getAddAttribute();
    const selectFields = [...baseFields, ...addAttribute];

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customers')
      .withDeleted()
      .select(selectFields);

    if (
      !tableBackFiltersIncludeAttribute(query, 'customers.customer_active')
    ) {
      queryBuilder.where('customers.customer_active = :active', {
        active: true,
      });
    }

    return tableBack.filterQuery(queryBuilder);
  }

  /** Case-insensitive match on name; creates an active customer when absent. */
  async findOrCreateByName(name: string) {
    const trimmed = name.trim();
    const existing = await this.customerRepository
      .createQueryBuilder('customer')
      .where('LOWER(customer.customer_name) = LOWER(:name)', { name: trimmed })
      .andWhere('customer.customer_deleted_date IS NULL')
      .getOne();

    if (existing) {
      return existing;
    }

    return this.customerRepository.save(
      this.customerRepository.create({
        customer_name: trimmed,
        customer_active: true,
      }),
    );
  }
}
