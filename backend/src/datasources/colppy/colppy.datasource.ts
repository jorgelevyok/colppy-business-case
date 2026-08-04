/**
 * Global TypeORM module for the COLPPY PostgreSQL database: auto-creates DB,
 * runs migrations/seeds on startup, then syncs functions/triggers.
 */
import { DatabaseSyncService } from '@datasources/datasource.sync.service';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions, MigrationExecutor } from 'typeorm';
import functions from './colppy.functions';
import triggers from './colppy.triggers';

const dataSourceName = 'COLPPY';

/** Named connection used by `@InjectRepository(..., 'COLPPY')` across modules. */
@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      name: dataSourceName,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger(dataSourceName);
        const logging = configService.get<boolean>('debug', false);
        const databaseName = configService.get<string>('databases.colppy.name');

        const defaultDataSourceOptions: DataSourceOptions = {
          type: 'postgres',
          host: configService.get<string>('databases.colppy.host'),
          port: configService.get<number>('databases.colppy.port'),
          username: configService.get<string>('databases.colppy.username'),
          password: configService.get<string>('databases.colppy.password'),
          database: 'postgres',
        };

        const defaultDataSource = new DataSource(defaultDataSourceOptions);

        try {
          await defaultDataSource.initialize();
          const result = await defaultDataSource.query(
            'SELECT 1 FROM pg_database WHERE datname = $1;',
            [databaseName],
          );

          if (result.length < 1) {
            await defaultDataSource.query(`CREATE DATABASE "${databaseName}";`);
          }
          await defaultDataSource.destroy();
        } catch (error) {
          logger.error('Error connecting to the default database', error);
          throw error;
        }

        const dataSourceOptions: DataSourceOptions = {
          type: 'postgres',
          host: configService.get<string>('databases.colppy.host'),
          port: configService.get<number>('databases.colppy.port'),
          username: configService.get<string>('databases.colppy.username'),
          password: configService.get<string>('databases.colppy.password'),
          database: databaseName,
          schema: 'public',
          synchronize: false,
          logging,
          entities: [`${__dirname}/entities/**/*.entity{.ts,.js}`],
          migrations: [
            `${__dirname}/migrations/*{.ts,.js}`,
            `${__dirname}/seeds/*{.ts,.js}`,
          ],
        };

        return dataSourceOptions;
      },
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options);
        const logger = new Logger(dataSourceName);

        try {
          await dataSource.initialize();
          logger.log('Database connected successfully');

          await dataSource.query('CREATE SCHEMA IF NOT EXISTS public');
          await dataSource.query('GRANT ALL ON SCHEMA public TO public');
          await dataSource.query('GRANT ALL ON SCHEMA public TO postgres');

          const migrationExecutor = new MigrationExecutor(dataSource);
          await migrationExecutor.executePendingMigrations();

          logger.log('Migrations executed successfully');
          await new DatabaseSyncService(
            dataSource,
            functions,
            triggers,
          ).syncDatabase();

          return dataSource;
        } catch (error) {
          logger.error('Error during database initialization', error);
          throw error;
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
/** Global Nest module exporting the COLPPY TypeORM connection. */
export class ColppyDataSource {}
