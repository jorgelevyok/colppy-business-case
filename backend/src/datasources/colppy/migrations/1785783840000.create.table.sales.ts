/** TypeORM migration: creates `sales` with foreign keys to customers, products, payment_methods. */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableSales1785783840000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'sales',
                columns: [
                    {
                        name: 'sale_id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'sale_id_public',
                        type: 'uuid',
                        isUnique: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'sale_code',
                        type: 'text',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'sale_date',
                        type: 'date',
                        isNullable: false,
                    },
                    {
                        name: 'customer_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'payment_method_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'sale_quantity',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'sale_amount',
                        type: 'numeric',
                        precision: 12,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'sale_creation_date',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'sale_updated_date',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'sale_deleted_date',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['customer_id'],
                        referencedTableName: 'customers',
                        referencedColumnNames: ['customer_id'],
                        onDelete: 'RESTRICT',
                        onUpdate: 'CASCADE',
                    },
                    {
                        columnNames: ['product_id'],
                        referencedTableName: 'products',
                        referencedColumnNames: ['product_id'],
                        onDelete: 'RESTRICT',
                        onUpdate: 'CASCADE',
                    },
                    {
                        columnNames: ['payment_method_id'],
                        referencedTableName: 'payment_methods',
                        referencedColumnNames: ['payment_method_id'],
                        onDelete: 'RESTRICT',
                        onUpdate: 'CASCADE',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('sales');
    }
}
