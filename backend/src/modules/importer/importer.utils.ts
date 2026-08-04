/**
 * Batch insert helper for large imports: chunks rows and backfills generated PKs on entities.
 */
import { DeepPartial, EntityManager, EntityTarget } from 'typeorm';

const DEFAULT_IMPORT_BATCH_SIZE = 500;
const MAX_IMPORT_BATCH_SIZE = 1000;

/** Clamps batch size to a safe range (default 500, max 1000). */
function getSafeImportBatchSize(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_IMPORT_BATCH_SIZE;
  return Math.min(Math.max(1, Math.floor(n)), MAX_IMPORT_BATCH_SIZE);
}

/**
 * Inserts rows in batches within a transaction manager.
 * @param batchSize Optional override; clamped by {@link getSafeImportBatchSize}.
 */
export async function insertInBatches<T>(
  manager: EntityManager,
  entity: EntityTarget<T>,
  rows: DeepPartial<T>[],
  batchSize?: number,
) {
  const effectiveBatchSize = getSafeImportBatchSize(batchSize);
  const repository = manager.getRepository(entity);
  const metadata = repository.metadata;
  const primaryColumn = metadata.primaryColumns[0];
  const primaryColumnName =
    primaryColumn.databaseName || primaryColumn.propertyName;

  for (let i = 0; i < rows.length; i += effectiveBatchSize) {
    const chunk = rows.slice(i, i + effectiveBatchSize);
    const insertResult = await repository.insert(chunk as any);
    const ids = insertResult.identifiers ?? [];
    for (let j = 0; j < chunk.length; j++) {
      const id = ids[j]?.[primaryColumnName];
      if (id != null) {
        (chunk[j] as any)[primaryColumnName] = id;
      }
    }
  }
}
