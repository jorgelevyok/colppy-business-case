import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ImporterController } from './importer.controller';
import { ImporterService } from './importer.service';

describe('ImporterController (e2e-ish)', () => {
  let app: INestApplication;
  const importerService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ImporterController],
      providers: [{ provide: ImporterService, useValue: importerService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validBody = {
    entity: 'sales',
    columns: [
      ['sale_date', {}],
      ['customer_name', {}],
      ['product_name', {}],
    ],
    rows: [['2024-01-15', 'Acme', 'Widget']],
    dryRun: true,
  };

  it('POST /importer runs import and returns summary', async () => {
    const payload = {
      message: 'Validación OK: 1 filas listas para importar',
      summary: { created: 1, errors: 0, total: 1 },
      results: [{ status: 'CREATED', rowIndex: 0 }],
    };
    importerService.create.mockResolvedValue(payload);

    const res = await request(app.getHttpServer())
      .post('/importer')
      .send(validBody)
      .expect(201);

    expect(res.body).toEqual(payload);
    expect(importerService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'sales',
        dryRun: true,
      }),
    );
  });

  it('POST /importer rejects unknown entity', async () => {
    await request(app.getHttpServer())
      .post('/importer')
      .send({ ...validBody, entity: 'customers' })
      .expect(400);

    expect(importerService.create).not.toHaveBeenCalled();
  });

  it('POST /importer rejects empty rows', async () => {
    await request(app.getHttpServer())
      .post('/importer')
      .send({ ...validBody, rows: [] })
      .expect(400);

    expect(importerService.create).not.toHaveBeenCalled();
  });
});
