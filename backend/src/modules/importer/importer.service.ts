/**
 * Orchestrates CSV import by entity type; aggregates row results and user-facing messages.
 */
import { ImportStrategy } from '@common/interfaces/importer.interface';
import { RESPONSES } from '@config/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ServiceError } from '@utils/service.error';
import { PostImporterBodyDTO } from './dto/importer.dto';
import { SalesImportStrategy } from './strategies/sales.strategy';

type ImportRowResult = {
  status: 'CREATED' | 'UPDATED' | 'ERROR';
  rowIndex?: number;
  row?: Record<string, unknown>;
  errors?: string[];
};

@Injectable()
export class ImporterService {
  private readonly logger = new Logger(ImporterService.name);
  private readonly strategies: Record<string, ImportStrategy>;

  constructor(private readonly salesStrategy: SalesImportStrategy) {
    this.strategies = {
      sales: this.salesStrategy,
    };
  }

  /** Counts CREATED/UPDATED vs ERROR rows for the response summary. */
  private buildSummary(results: ImportRowResult[]) {
    let created = 0;
    let errors = 0;

    for (const item of results) {
      if (item?.status === 'ERROR') errors += 1;
      else if (item?.status === 'CREATED' || item?.status === 'UPDATED') {
        created += 1;
      }
    }

    return {
      created,
      errors,
      total: results.length,
    };
  }

  /** Human-readable import/validation message from summary counts (Spanish UI copy). */
  private buildMessage(
    summary: { created: number; errors: number; total: number },
    dryRun = false,
  ) {
    if (summary.total === 0) {
      return 'No se recibieron filas para importar';
    }

    if (dryRun) {
      if (summary.errors === 0) {
        return `Validación OK: ${summary.created} filas listas para importar`;
      }
      if (summary.created === 0) {
        return `Validación con errores: ${summary.errors} filas inválidas`;
      }
      return `Validación parcial: ${summary.created} OK y ${summary.errors} con error`;
    }

    if (summary.errors === 0) {
      return `Se importaron ${summary.created} ventas correctamente`;
    }
    if (summary.created === 0) {
      return `No se importó ninguna venta. ${summary.errors} filas con error`;
    }
    return `Importación parcial: ${summary.created} importadas y ${summary.errors} con error`;
  }

  /**
   * Runs the strategy for `body.entity` and returns message, summary, and per-row results.
   * @param body Parsed import payload from the frontend CSV parser.
   */
  async create(body: PostImporterBodyDTO) {
    const strategy = this.strategies[body.entity];

    if (!strategy) {
      throw new ServiceError({
        statusCode: RESPONSES.NOT_FOUND.statusCode,
        message: {
          es: 'No se encontró el tipo de importación indicado',
          en: 'Import entity not found',
        },
      });
    }

    try {
      const results = (await strategy.process(body)) as ImportRowResult[];
      const summary = this.buildSummary(results);
      const message = this.buildMessage(summary, Boolean(body.dryRun));

      return {
        message,
        summary,
        results,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      this.logger.error(error);
      throw new ServiceError({
        statusCode: RESPONSES.BAD_REQUEST.statusCode,
        message: {
          es: 'No se pudo procesar el archivo de importación. Revisá el formato e intentá de nuevo',
          en: 'Could not process the import file',
        },
      });
    }
  }
}
