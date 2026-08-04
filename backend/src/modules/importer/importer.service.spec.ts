import { ServiceError } from '@utils/service.error';
import { ImporterService } from './importer.service';
import { SalesImportStrategy } from './strategies/sales.strategy';

describe('ImporterService', () => {
  const salesStrategy = {
    process: jest.fn(),
  };

  let service: ImporterService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImporterService(
      salesStrategy as unknown as SalesImportStrategy,
    );
  });

  it('throws NOT_FOUND for unknown entity', async () => {
    await expect(
      service.create({
        entity: 'unknown',
        columns: [['a', {}]],
        rows: [['x']],
      } as any),
    ).rejects.toBeInstanceOf(ServiceError);
  });

  it('returns OK message when all rows succeed', async () => {
    salesStrategy.process.mockResolvedValue([
      { status: 'CREATED', rowIndex: 0 },
      { status: 'UPDATED', rowIndex: 1 },
    ]);

    const result = await service.create({
      entity: 'sales',
      columns: [['sale_date', {}]],
      rows: [['2024-01-01'], ['2024-01-02']],
      dryRun: false,
    } as any);

    expect(result.summary).toEqual({ created: 2, errors: 0, total: 2 });
    expect(result.message).toBe('Se importaron 2 ventas correctamente');
  });

  it('returns dry-run validation message with partial errors', async () => {
    salesStrategy.process.mockResolvedValue([
      { status: 'CREATED', rowIndex: 0 },
      { status: 'ERROR', rowIndex: 1, errors: ['bad'] },
    ]);

    const result = await service.create({
      entity: 'sales',
      columns: [['sale_date', {}]],
      rows: [['2024-01-01'], ['bad']],
      dryRun: true,
    } as any);

    expect(result.summary).toEqual({ created: 1, errors: 1, total: 2 });
    expect(result.message).toBe(
      'Validación parcial: 1 OK y 1 con error',
    );
  });

  it('wraps unexpected strategy errors as BAD_REQUEST', async () => {
    const errorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation(() => undefined);
    salesStrategy.process.mockRejectedValue(new Error('boom'));

    await expect(
      service.create({
        entity: 'sales',
        columns: [['sale_date', {}]],
        rows: [['2024-01-01']],
      } as any),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ statusCode: 400 }),
    });

    errorSpy.mockRestore();
  });
});
