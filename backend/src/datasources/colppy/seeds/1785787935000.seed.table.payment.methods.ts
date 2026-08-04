/**
 * TypeORM seed migration: inserts default payment methods used by the UI and CSV import.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const PAYMENT_METHOD_NAMES = ['transferencia', 'tarjeta', 'efectivo'] as const;

export class SeedTablePaymentMethods1785787935000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const name of PAYMENT_METHOD_NAMES) {
            await queryRunner.query(`INSERT INTO payment_methods (payment_method_name) VALUES ($1);`, [name]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM payment_methods WHERE payment_method_name = ANY($1);`, [
            PAYMENT_METHOD_NAMES,
        ]);
    }
}
