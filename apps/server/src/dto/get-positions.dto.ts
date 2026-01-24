import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";

import { PAGINATION } from "../constants";
import { ClampPagination, DetailLevel, MinValue, OrderDirection, ToBoolean, ToNumber } from "./common.dto";
import { IsEthereumAddress } from "./ethereum.validator";

export class GetPositionsQueryDto {
  @IsEthereumAddress()
  owner!: string;

  @IsOptional()
  @ToNumber()
  @IsInt()
  @ClampPagination(1, PAGINATION.MAX_PAGE_SIZE)
  first?: number = PAGINATION.DEFAULT_PAGE_SIZE;

  @IsOptional()
  @ToNumber()
  @IsInt()
  @MinValue(0)
  skip?: number = 0;

  @IsOptional()
  @ToBoolean()
  closed?: boolean = false;

  @IsOptional()
  @IsString()
  orderBy?: string = "createdAtTimestamp";

  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection = OrderDirection.DESC;

  @IsOptional()
  @IsEnum(DetailLevel)
  detail?: DetailLevel = DetailLevel.BASIC;
}
