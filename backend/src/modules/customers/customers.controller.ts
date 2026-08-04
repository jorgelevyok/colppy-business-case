/** Customer grid endpoint for TableBack. */
import { ApiTableBackQuery } from '@common/decorators/controllers.decorators';
import { QueryParamsDTO } from '@common/dto/common.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('table-back')
  @ApiTableBackQuery()
  findForTableBack(@Query() query: QueryParamsDTO) {
    return this.customersService.findForTableBack(query);
  }
}
