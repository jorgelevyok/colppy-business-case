/**
 * Contract for entity-specific CSV import handlers registered in {@link ImporterService}.
 */
import { PostImporterBodyDTO } from '@modules/importer/dto/importer.dto';

/** Processes parsed import payload and returns per-row results. */
export interface ImportStrategy {
  /**
   * @returns Per-row import results (status, errors, optional row snapshot).
   */
  process(body: PostImporterBodyDTO): Promise<any>;
}
