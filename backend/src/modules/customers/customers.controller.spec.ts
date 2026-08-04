import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController (e2e-ish)', () => {
  let app: INestApplication;
  const customersService = {
    findForTableBack: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [{ provide: CustomersService, useValue: customersService }],
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

  it('GET /customers/table-back returns grid payload', async () => {
    const payload = {
      rows: [{ customer_id: 1, customer_name: 'Acme' }],
      count: 1,
    };
    customersService.findForTableBack.mockResolvedValue(payload);

    const res = await request(app.getHttpServer())
      .get('/customers/table-back')
      .expect(200);

    expect(res.body).toEqual(payload);
    expect(customersService.findForTableBack).toHaveBeenCalled();
  });
});
