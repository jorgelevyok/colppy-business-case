import { RESPONSES } from '@config/constants';
import { ServiceError } from '@utils/service.error';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  const saleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const customersService = {
    findOrCreateByName: jest.fn(),
  };
  const productsService = {
    findOrCreateByName: jest.fn(),
  };
  const paymentMethodsService = {
    ensureActiveById: jest.fn(),
  };

  let service: SalesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SalesService(
      saleRepository as any,
      customersService as any,
      productsService as any,
      paymentMethodsService as any,
    );
  });

  it('create resolves related entities and saves the sale', async () => {
    customersService.findOrCreateByName.mockResolvedValue({ customer_id: 10 });
    productsService.findOrCreateByName.mockResolvedValue({ product_id: 20 });
    paymentMethodsService.ensureActiveById.mockResolvedValue({
      payment_method_id: 1,
    });

    const created = { sale_id_public: '550e8400-e29b-41d4-a716-446655440000' };
    const saved = { ...created };
    const withRelations = {
      ...saved,
      customer: { customer_name: 'Acme' },
      product: { product_name: 'Widget' },
    };

    saleRepository.create.mockReturnValue(created);
    saleRepository.save.mockResolvedValue(saved);
    saleRepository.findOne.mockResolvedValue(withRelations);

    const result = await service.create({
      sale_date: '2024-01-15',
      customer_name: 'Acme',
      product_name: 'Widget',
      sale_quantity: 2,
      sale_amount: 100,
      payment_method_id: 1,
    });

    expect(customersService.findOrCreateByName).toHaveBeenCalledWith('Acme');
    expect(productsService.findOrCreateByName).toHaveBeenCalledWith('Widget');
    expect(paymentMethodsService.ensureActiveById).toHaveBeenCalledWith(1);
    expect(saleRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: 10,
        product_id: 20,
        sale_quantity: 2,
        sale_amount: '100',
      }),
    );
    expect(result).toEqual(withRelations);
  });

  it('update throws NOT_FOUND when sale does not exist', async () => {
    saleRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('550e8400-e29b-41d4-a716-446655440000', {
        sale_quantity: 3,
      }),
    ).rejects.toBeInstanceOf(ServiceError);

    await expect(
      service.update('550e8400-e29b-41d4-a716-446655440000', {
        sale_quantity: 3,
      }),
    ).rejects.toMatchObject({
      response: RESPONSES.NOT_FOUND,
    });
  });
});
