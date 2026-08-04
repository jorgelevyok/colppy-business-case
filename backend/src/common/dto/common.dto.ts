/**
 * Shared query DTO for TableBack list endpoints: pagination, sorting,
 * JSON filters, soft-delete mode, search, and extra SELECT fields.
 */
import {
  TransformStringBoolean,
  TransformStringNumber,
} from '@common/decorators/transformers.decorators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiHideProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

/** Query string parameters consumed by {@link TableBack}. */
export class QueryParamsDTO {
  @ApiHideProperty()
  @IsString()
  @IsIn(['exclude', 'include', 'only'])
  @IsOptional()
  deleted?: string = 'exclude';

  @ApiHideProperty()
  @IsOptional()
  @TransformStringBoolean()
  pagination?: boolean = false;

  @ApiHideProperty()
  @IsOptional()
  @ValidateIf((o) => o.pagination === true)
  @TransformStringNumber()
  @IsInt()
  page?: number = 1;

  @ApiHideProperty()
  @IsOptional()
  @ValidateIf((o) => o.pagination === true)
  @TransformStringNumber()
  @IsInt()
  per_page?: number = 5;

  @ApiHideProperty()
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === '') return [];
    const raw = Array.isArray(value) ? value.join(',') : String(value);
    const allowedValues = ['ASC', 'DESC'];
    const values = raw
      .split(',')
      .map((val: string) => val.trim())
      .filter(Boolean);
    const invalidValues = values.filter(
      (val: string) => !allowedValues.includes(val),
    );
    if (invalidValues.length > 0) {
      throw new HttpException(
        `Invalid order values: ${invalidValues.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return values;
  })
  order?: string[] = [];

  @ApiHideProperty()
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === '') return [];
    const raw = Array.isArray(value) ? value : String(value);
    return (Array.isArray(raw) ? raw : raw.split(','))
      .map((val: string) => String(val).trim())
      .filter(Boolean);
  })
  @IsArray()
  order_by?: string[] = [];

  @ApiHideProperty()
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === '') return null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(String(value));
    } catch {
      throw new HttpException('Invalid filters JSON', HttpStatus.BAD_REQUEST);
    }
  })
  filters?: any | null;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  search_field?: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  search_value?: string;

  @ApiHideProperty()
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === '') return [];
    const raw = Array.isArray(value) ? value : String(value);
    return (Array.isArray(raw) ? raw : raw.split(','))
      .map((val: string) => String(val).trim())
      .filter(Boolean);
  })
  @IsArray()
  add_attribute?: string[];
}

/** Route param DTO for resources identified by public UUID. */
export class IdPublicParamDTO {
  @IsUUID()
  id_public: string;
}
