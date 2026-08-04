/**
 * Nest ConfigModule factory: reads process.env and exposes typed settings
 * (service name, port, debug flag, Colppy PostgreSQL connection).
 */
export default () => ({
    serviceName: process.env.SERVICE_NAME || 'colppy-sales',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '3000',
    debug: process.env.DEBUG === 'true',
    databases: {
        colppy: {
            type: 'postgres',
            host: process.env.COLPPY_DATABASE_HOST,
            port: parseInt(process.env.COLPPY_DATABASE_PORT ?? '5432', 10),
            username: process.env.COLPPY_DATABASE_USERNAME || 'postgres',
            password: process.env.COLPPY_DATABASE_PASSWORD,
            name: process.env.COLPPY_DATABASE_NAME || 'colppy_business_case',
        },
    },
});
