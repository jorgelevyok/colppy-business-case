/** TypeORM migration: creates the `payment_methods` table. */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTablePaymentMethods1785783780000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payment_methods',
        columns: [
          {
            name: 'payment_method_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'payment_method_id_public',
            type: 'uuid',
            isUnique: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'payment_method_name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'payment_method_creation_date',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'payment_method_updated_date',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'payment_method_deleted_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'payment_method_active',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payment_methods');
  }
}
