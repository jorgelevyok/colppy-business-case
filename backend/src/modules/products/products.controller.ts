/** Product grid endpoint for TableBack. */
import { ApiTableBackQuery } from '@common/decorators/controllers.decorators';
import { QueryParamsDTO } from '@common/dto/common.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('table-back')
  @ApiTableBackQuery()
  findForTableBack(@Query() query: QueryParamsDTO) {
    return this.productsService.findForTableBack(query);
  }
}
