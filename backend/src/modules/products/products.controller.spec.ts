import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController (e2e-ish)', () => {
  let app: INestApplication;
  const productsService = {
    findForTableBack: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /products/table-back returns grid payload', async () => {
    const payload = {
      rows: [{ product_id: 1, product_name: 'Widget' }],
      count: 1,
    };
    productsService.findForTableBack.mockResolvedValue(payload);

    const res = await request(app.getHttpServer())
      .get('/products/table-back')
      .expect(200);

    expect(res.body).toEqual(payload);
    expect(productsService.findForTableBack).toHaveBeenCalled();
  });
});
