import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

describe('SalesController (e2e-ish)', () => {
  let app: INestApplication;
  const salesService = {
    findForTableBack: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const saleFixture = {
    sale_id_public: '550e8400-e29b-41d4-a716-446655440000',
    sale_date: '2024-01-15',
    sale_quantity: 2,
    sale_amount: '100.00',
    customer: { customer_name: 'Acme' },
    product: { product_name: 'Widget' },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [{ provide: SalesService, useValue: salesService }],
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

  it('GET /sales/table-back returns grid payload', async () => {
    const payload = { rows: [saleFixture], count: 1 };
    salesService.findForTableBack.mockResolvedValue(payload);

    const res = await request(app.getHttpServer())
      .get('/sales/table-back')
      .query({ page: 1, pageSize: 10 })
      .expect(200);

    expect(res.body).toEqual(payload);
    expect(salesService.findForTableBack).toHaveBeenCalled();
  });

  it('POST /sales creates a sale with valid body', async () => {
    salesService.create.mockResolvedValue(saleFixture);

    const body = {
      sale_date: '2024-01-15',
      customer_name: 'Acme',
      product_name: 'Widget',
      sale_quantity: 2,
      sale_amount: 100,
      payment_method_id: 1,
    };

    const res = await request(app.getHttpServer())
      .post('/sales')
      .send(body)
      .expect(201);

    expect(res.body).toEqual(saleFixture);
    expect(salesService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_name: 'Acme',
        product_name: 'Widget',
        sale_quantity: 2,
        payment_method_id: 1,
      }),
    );
  });

  it('POST /sales rejects invalid body', async () => {
    await request(app.getHttpServer())
      .post('/sales')
      .send({ customer_name: 'Acme' })
      .expect(400);

    expect(salesService.create).not.toHaveBeenCalled();
  });

  it('PUT /sales/:sale_id_public updates a sale', async () => {
    const updated = { ...saleFixture, sale_quantity: 5 };
    salesService.update.mockResolvedValue(updated);

    const res = await request(app.getHttpServer())
      .put(`/sales/${saleFixture.sale_id_public}`)
      .send({ sale_quantity: 5 })
      .expect(200);

    expect(res.body).toEqual(updated);
    expect(salesService.update).toHaveBeenCalledWith(
      saleFixture.sale_id_public,
      expect.objectContaining({ sale_quantity: 5 }),
    );
  });

  it('PUT /sales/:sale_id_public rejects non-UUID param', async () => {
    await request(app.getHttpServer())
      .put('/sales/not-a-uuid')
      .send({ sale_quantity: 1 })
      .expect(400);

    expect(salesService.update).not.toHaveBeenCalled();
  });
});
