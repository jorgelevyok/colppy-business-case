import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PaymentMethodsController } from './payment.methods.controller';
import { PaymentMethodsService } from './payment.methods.service';

describe('PaymentMethodsController (e2e-ish)', () => {
  let app: INestApplication;
  const paymentMethodsService = {
    getAll: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodsController],
      providers: [
        { provide: PaymentMethodsService, useValue: paymentMethodsService },
      ],
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

  it('GET /payment-methods returns active methods', async () => {
    const methods = [
      { payment_method_id: 1, payment_method_name: 'efectivo' },
      { payment_method_id: 2, payment_method_name: 'transferencia' },
    ];
    paymentMethodsService.getAll.mockResolvedValue(methods);

    const res = await request(app.getHttpServer())
      .get('/payment-methods')
      .expect(200);

    expect(res.body).toEqual(methods);
    expect(paymentMethodsService.getAll).toHaveBeenCalled();
  });
});
