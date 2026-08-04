/** TypeORM migration: creates the `customers` table. */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableCustomers1785783660000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'customer_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'customer_id_public',
            type: 'uuid',
            isUnique: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'customer_name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'customer_creation_date',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'customer_updated_date',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'customer_deleted_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'customer_active',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customers');
  }
}
