/**
 * Root application module: global configuration, PostgreSQL datasource,
 * feature modules, and request logging middleware on all routes.
 */
import { ColppyDataSource } from '@datasources/colppy/colppy.datasource';
import { CustomersModule } from '@modules/customers/customers.module';
import { ImporterModule } from '@modules/importer/importer.module';
import { PaymentMethodsModule } from '@modules/payment_methods/payment.methods.module';
import { ProductsModule } from '@modules/products/products.module';
import { SalesModule } from '@modules/sales/sales.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggingMiddleware } from './middlewares/logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    ColppyDataSource,
    CustomersModule,
    ProductsModule,
    PaymentMethodsModule,
    SalesModule,
    ImporterModule,
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
/** Registers {@link LoggingMiddleware} for every route. */
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('{*path}');
  }
}
