/** TypeORM migration: creates the `products` table. */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableProducts1785783720000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'products',
                columns: [
                    {
                        name: 'product_id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'product_id_public',
                        type: 'uuid',
                        isUnique: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'product_name',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'product_creation_date',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'product_updated_date',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'product_deleted_date',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                    {
                        name: 'product_active',
                        type: 'boolean',
                        default: true,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('products');
    }
}
