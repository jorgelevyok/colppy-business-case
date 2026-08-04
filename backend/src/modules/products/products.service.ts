/**
 * Product lookups for grids and upsert-by-name used by sales and import.
 */
import { QueryParamsDTO } from '@common/dto/common.dto';
import { Product } from '@datasources/colppy/entities/product.entity';
import {
  TableBack,
  tableBackFiltersIncludeAttribute,
} from '@datasources/datasource.table.back';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product, 'COLPPY')
    private readonly productRepository: Repository<Product>,
  ) {}

  /** TableBack listing; defaults to active products unless filters override. */
  async findForTableBack(query: QueryParamsDTO) {
    const tableBack = new TableBack(query);

    const baseFields = [
      'products.product_id',
      'products.product_id_public',
      'products.product_name',
      'products.product_creation_date',
      'products.product_updated_date',
      'products.product_deleted_date',
      'products.product_active',
    ];

    const addAttribute = tableBack.getAddAttribute();
    const selectFields = [...baseFields, ...addAttribute];

    const queryBuilder = this.productRepository
      .createQueryBuilder('products')
      .withDeleted()
      .select(selectFields);

    if (!tableBackFiltersIncludeAttribute(query, 'products.product_active')) {
      queryBuilder.where('products.product_active = :active', {
        active: true,
      });
    }

    return tableBack.filterQuery(queryBuilder);
  }

  /** Case-insensitive match on name; creates an active product when absent. */
  async findOrCreateByName(name: string) {
    const trimmed = name.trim();
    const existing = await this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.product_name) = LOWER(:name)', { name: trimmed })
      .andWhere('product.product_deleted_date IS NULL')
      .getOne();

    if (existing) {
      return existing;
    }

    return this.productRepository.save(
      this.productRepository.create({
        product_name: trimmed,
        product_active: true,
      }),
    );
  }
}
