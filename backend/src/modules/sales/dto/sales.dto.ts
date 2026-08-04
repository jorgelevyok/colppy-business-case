/** Request/response DTOs and route params for sales endpoints. */
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

/** Validates body for POST /sales. */
export class PostSaleBodyDTO {
  @IsDateString()
  sale_date: string;

  @IsString()
  @MinLength(1)
  customer_name: string;

  @IsString()
  @MinLength(1)
  product_name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sale_quantity: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sale_amount: number;

  @Type(() => Number)
  @IsInt()
  payment_method_id: number;
}

/** All POST fields optional for PUT /sales/:sale_id_public. */
export class PutSaleBodyDTO extends PartialType(PostSaleBodyDTO) {}

/** Route param: public UUID of a sale. */
export class SaleIdPublicParamDTO {
  @IsUUID()
  sale_id_public: string;
}
