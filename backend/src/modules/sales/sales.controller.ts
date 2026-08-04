/**
 * HTTP routes for sales: TableBack listing, create, and update by public id.
 */
import { ApiTableBackQuery } from '@common/decorators/controllers.decorators';
import { QueryParamsDTO } from '@common/dto/common.dto';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  PostSaleBodyDTO,
  PutSaleBodyDTO,
  SaleIdPublicParamDTO,
} from './dto/sales.dto';
import { SalesService } from './sales.service';

/** Sales REST controller under `/sales`. */
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('table-back')
  @ApiTableBackQuery()
  /** Grid data for the sales TableBack frontend component. */
  findForTableBack(@Query() query: QueryParamsDTO) {
    return this.salesService.findForTableBack(query);
  }

  @Post()
  create(@Body() body: PostSaleBodyDTO) {
    return this.salesService.create(body);
  }

  @Put(':sale_id_public')
  update(
    @Param() params: SaleIdPublicParamDTO,
    @Body() body: PutSaleBodyDTO,
  ) {
    return this.salesService.update(params.sale_id_public, body);
  }
}
