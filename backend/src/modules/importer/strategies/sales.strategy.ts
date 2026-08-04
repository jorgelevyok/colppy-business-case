/**
 * Sales CSV import strategy: validates rows, supports dry-run, persists sales with related entities.
 * Expected column keys: id_venta, fecha, cliente, producto, cantidad, importe, medio_pago.
 */
import { ImportStrategy } from '@common/interfaces/importer.interface';
import { ImporterColumnTuple } from '@common/types/importer.types';
import { Sale } from '@datasources/colppy/entities/sale.entity';
import { CustomersService } from '@modules/customers/customers.service';
import { PaymentMethodsService } from '@modules/payment_methods/payment.methods.service';
import { ProductsService } from '@modules/products/products.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostImporterBodyDTO } from '../dto/importer.dto';

const COLUMN_KEYS = {
  idVenta: 'id_venta',
  fecha: 'fecha',
  cliente: 'cliente',
  producto: 'producto',
  cantidad: 'cantidad',
  importe: 'importe',
  medioPago: 'medio_pago',
} as const;

type SalesImportRowResult = {
  status: 'CREATED' | 'ERROR';
  rowIndex: number;
  row: Record<string, unknown>;
  errors: string[];
};

type ParsedSaleRow = {
  sale_code: string;
  sale_date: string;
  customer_name: string;
  product_name: string;
  sale_quantity: number;
  sale_amount: number;
  payment_method_id: number;
};

/** {@link ImportStrategy} implementation for entity `sales`. */
@Injectable()
export class SalesImportStrategy implements ImportStrategy {
  private readonly logger = new Logger(SalesImportStrategy.name);

  constructor(
    @InjectRepository(Sale, 'COLPPY')
    private readonly saleRepository: Repository<Sale>,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  /** True for null, undefined, or blank strings. */
  private isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
  }

  /** Lowercases trimmed payment/customer name keys for map lookup. */
  private normalizeName(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }

  /** Accepts ISO dates or DD/MM/YYYY (also DD-MM-YYYY); returns ISO date string or null. */
  private parseDate(value: unknown): string | null {
    if (this.isEmpty(value)) return null;
    const raw = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const date = new Date(`${raw}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime())) return null;
      return raw;
    }

    const match = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      const iso = `${year}-${month}-${day}`;
      const date = new Date(`${iso}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime())) return null;
      return iso;
    }

    return null;
  }

  /** Parses quantity as integer >= 1. */
  private parsePositiveInt(value: unknown): number | null {
    if (this.isEmpty(value)) return null;
    const num = Number(String(value).replace(',', '.'));
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) return null;
    return num;
  }

  /** Parses decimal amount >= 0 with two decimal places. */
  private parseAmount(value: unknown): number | null {
    if (this.isEmpty(value)) return null;
    const num = Number(String(value).replace(',', '.'));
    if (!Number.isFinite(num) || num < 0) return null;
    return Math.round(num * 100) / 100;
  }

  /** Maps column tuple order to a keyed row object for validation messages. */
  private buildRowObject(
    columns: ImporterColumnTuple[],
    values: unknown[],
  ): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (let i = 0; i < columns.length; i++) {
      const [colName] = columns[i];
      row[colName] = values[i];
    }
    return row;
  }

  /** Validates one CSV row; checks duplicates in file and existing sale_code in DB. */
  private processRow(
    columns: ImporterColumnTuple[],
    values: unknown[],
    rowIndex: number,
    paymentMethodsByName: Map<string, { id: number; name: string }>,
    seenCodes: Set<string>,
    existingCodes: Set<string>,
  ): { result: SalesImportRowResult; parsed: ParsedSaleRow | null } {
    const rowOriginal = this.buildRowObject(columns, values);
    const errors: string[] = [];

    const saleCode = this.isEmpty(rowOriginal[COLUMN_KEYS.idVenta])
      ? ''
      : String(rowOriginal[COLUMN_KEYS.idVenta]).trim();
    if (!saleCode) {
      errors.push('id_venta es obligatorio');
    } else {
      const codeKey = saleCode.toLowerCase();
      if (seenCodes.has(codeKey)) {
        errors.push(`id_venta duplicado en el archivo: ${saleCode}`);
      } else {
        seenCodes.add(codeKey);
      }
      if (existingCodes.has(codeKey)) {
        errors.push(`Ya existe una venta con id_venta: ${saleCode}`);
      }
    }

    const saleDate = this.parseDate(rowOriginal[COLUMN_KEYS.fecha]);
    if (!saleDate) {
      errors.push('fecha inválida (usar YYYY-MM-DD o DD-MM-YYYY)');
    }

    const customerName = this.isEmpty(rowOriginal[COLUMN_KEYS.cliente])
      ? ''
      : String(rowOriginal[COLUMN_KEYS.cliente]).trim();
    if (!customerName) {
      errors.push('cliente es obligatorio');
    }

    const productName = this.isEmpty(rowOriginal[COLUMN_KEYS.producto])
      ? ''
      : String(rowOriginal[COLUMN_KEYS.producto]).trim();
    if (!productName) {
      errors.push('producto es obligatorio');
    }

    const quantity = this.parsePositiveInt(rowOriginal[COLUMN_KEYS.cantidad]);
    if (quantity == null) {
      errors.push('cantidad debe ser un entero mayor a 0');
    }

    const amount = this.parseAmount(rowOriginal[COLUMN_KEYS.importe]);
    if (amount == null) {
      errors.push('importe debe ser un número mayor o igual a 0');
    }

    const paymentRaw = this.isEmpty(rowOriginal[COLUMN_KEYS.medioPago])
      ? ''
      : String(rowOriginal[COLUMN_KEYS.medioPago]).trim();
    const payment = paymentRaw
      ? paymentMethodsByName.get(this.normalizeName(paymentRaw))
      : null;
    if (!paymentRaw) {
      errors.push('medio_pago es obligatorio');
    } else if (!payment) {
      errors.push(`medio_pago no válido: ${paymentRaw}`);
    }

    if (errors.length > 0) {
      return {
        result: {
          status: 'ERROR',
          rowIndex,
          row: rowOriginal,
          errors,
        },
        parsed: null,
      };
    }

    return {
      result: {
        status: 'CREATED',
        rowIndex,
        row: rowOriginal,
        errors: [],
      },
      parsed: {
        sale_code: saleCode,
        sale_date: saleDate!,
        customer_name: customerName,
        product_name: productName,
        sale_quantity: quantity!,
        sale_amount: amount!,
        payment_method_id: payment!.id,
      },
    };
  }

  /** Validates and optionally persists all rows; rowIndex uses 1-based CSV line numbers (header = 1). */
  async process(body: PostImporterBodyDTO) {
    const columns = body.columns as ImporterColumnTuple[];
    const paymentMethods = await this.paymentMethodsService.getAll();
    const paymentMethodsByName = new Map(
      paymentMethods.map((method) => [
        this.normalizeName(method.payment_method_name),
        {
          id: method.payment_method_id,
          name: method.payment_method_name,
        },
      ]),
    );

    const codesInFile = body.rows
      .map((values) => {
        const row = this.buildRowObject(columns, values);
        if (this.isEmpty(row[COLUMN_KEYS.idVenta])) return null;
        return String(row[COLUMN_KEYS.idVenta]).trim();
      })
      .filter((code): code is string => Boolean(code));

    const uniqueCodes = [...new Set(codesInFile.map((code) => code.toLowerCase()))];
    const existingSales =
      uniqueCodes.length > 0
        ? await this.saleRepository
            .createQueryBuilder('sales')
            .withDeleted()
            .select(['sales.sale_id', 'sales.sale_code'])
            .where('LOWER(sales.sale_code) IN (:...codes)', { codes: uniqueCodes })
            .getMany()
        : [];
    const existingCodes = new Set(
      existingSales
        .map((sale) => sale.sale_code)
        .filter((code): code is string => Boolean(code))
        .map((code) => code.toLowerCase()),
    );

    const seenCodes = new Set<string>();
    const results: SalesImportRowResult[] = [];
    const parsedByIndex: Array<ParsedSaleRow | null> = [];

    body.rows.forEach((values, index) => {
      const { result, parsed } = this.processRow(
        columns,
        values,
        index + 2,
        paymentMethodsByName,
        seenCodes,
        existingCodes,
      );
      results.push(result);
      parsedByIndex.push(parsed);
    });

    if (body.dryRun) {
      return results;
    }

    const toCreateCount = parsedByIndex.filter(Boolean).length;
    this.logger.verbose(
      `Importing ${toCreateCount} sales from ${body.file_name ?? 'csv'}`,
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const parsed = parsedByIndex[i];
      if (result.status !== 'CREATED' || !parsed) continue;

      try {
        const customer = await this.customersService.findOrCreateByName(
          parsed.customer_name,
        );
        const product = await this.productsService.findOrCreateByName(
          parsed.product_name,
        );

        await this.saleRepository.save(
          this.saleRepository.create({
            sale_code: parsed.sale_code,
            sale_date: parsed.sale_date,
            customer_id: customer.customer_id,
            product_id: product.product_id,
            payment_method_id: parsed.payment_method_id,
            sale_quantity: parsed.sale_quantity,
            sale_amount: String(parsed.sale_amount),
          }),
        );
      } catch (error) {
        result.status = 'ERROR';
        result.errors = [
          error instanceof Error
            ? error.message
            : 'No se pudo guardar la fila',
        ];
      }
    }

    return results;
  }
}
