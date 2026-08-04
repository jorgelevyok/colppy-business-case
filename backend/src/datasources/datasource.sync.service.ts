/**
 * Applies PostgreSQL functions and triggers when their definition hash changes.
 * Tracks versions in `function_versions` to avoid redundant DDL on startup.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { FunctionVersion } from './colppy/entities/function.version.entity';

interface DatabaseTrigger {
  table: string;
  schema: string;
  name: string;
  definition: string;
}

interface DatabaseFunction {
  schema: string;
  name: string;
  returns: string;
  params: string;
  language: string;
  definition: string;
}

/** Syncs configured DB functions and triggers inside a transaction. */
@Injectable()
export class DatabaseSyncService {
  private readonly logger = new Logger(DatabaseSyncService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly functions: DatabaseFunction[],
    private readonly triggers: DatabaseTrigger[],
  ) {}

  /** SHA-256 of function/trigger body for change detection. */
  private calculateHash(obj: DatabaseFunction | DatabaseTrigger): string {
    return crypto.createHash('sha256').update(obj.definition).digest('hex');
  }

  private async existingObjectVersions(
    repository: Repository<FunctionVersion>,
  ): Promise<Record<string, string>> {
    try {
      const result = await repository
        .createQueryBuilder('function_versions')
        .select('jsonb_object_agg(name, hash)', 'versions')
        .getRawOne();

      return result?.versions || {};
    } catch (error) {
      this.logger.error(
        'Error fetching existing database function versions',
        error,
      );
      return {};
    }
  }

  /** Creates or updates objects whose hash differs from the stored version. */
  async syncDatabase(): Promise<void> {
    const repository = this.dataSource.getRepository(FunctionVersion);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      await this.dataSource.query(`
                CREATE TABLE IF NOT EXISTS public.function_versions (
                    name VARCHAR NOT NULL,
                    hash TEXT NOT NULL,
                    PRIMARY KEY (name)
                );
            `);

      const existingVersions = await this.existingObjectVersions(repository);

      await this.processObjects(
        this.functions,
        existingVersions,
        repository,
        queryRunner,
      );
      await this.processObjects(
        this.triggers,
        existingVersions,
        repository,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      this.logger.log('Database objects initialized successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error during database objects initialization', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async processObjects(
    objects: DatabaseFunction[] | DatabaseTrigger[],
    existingVersions: Record<string, string>,
    repository: Repository<FunctionVersion>,
    queryRunner: QueryRunner,
  ) {
    for (const obj of objects) {
      if (!obj) continue;
      const existingHash = existingVersions[obj.name];
      const newHash = this.calculateHash(obj);
      if (existingHash !== newHash) {
        await this.createObject(obj, queryRunner);
        await this.upsertObjectVersion(repository, obj, newHash);
      }
    }
  }

  private async createObject(
    obj: DatabaseFunction | DatabaseTrigger,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      let query: string;
      if ('returns' in obj) {
        const { name, schema, params, returns, language, definition } = obj;
        query = `
                    DROP FUNCTION IF EXISTS "${schema}"."${name}" CASCADE;
                    CREATE OR REPLACE FUNCTION "${schema}"."${name}"(${params})
                    RETURNS ${returns}
                    LANGUAGE ${language}
                    AS $function$
                        ${definition}
                    $function$;
                `;
      } else {
        const { name, schema, table } = obj;
        query =
          `DROP TRIGGER IF EXISTS ${name} ON ${schema}.${table};` +
          obj.definition;
      }

      await queryRunner.query(query);
      this.logger.log(
        `Successfully created/updated: ${obj.schema}.${obj.name}`,
      );
    } catch (error) {
      this.logger.error(`Error creating ${obj.name}`, error);
      throw error;
    }
  }

  private async upsertObjectVersion(
    repository: Repository<FunctionVersion>,
    obj: DatabaseFunction | DatabaseTrigger,
    newHash: string,
  ): Promise<void> {
    await repository
      .createQueryBuilder()
      .insert()
      .into(FunctionVersion)
      .values({
        name: obj.name,
        hash: newHash,
      })
      .orUpdate(['hash'], ['name'])
      .execute();
  }
}
