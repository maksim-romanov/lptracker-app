import { IsEnum, IsInt, IsOptional } from "class-validator";

import { PAGINATION } from "../constants";
import { ClampPagination, DetailLevel, MinValue, ToBoolean, ToNumber } from "./common.dto";
import { IsEthereumAddress } from "./ethereum.validator";
import { OrderDirection, Position_OrderBy } from "../gql/graphql";

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
  @IsEnum(Position_OrderBy)
  orderBy?: Position_OrderBy = Position_OrderBy.CreatedAtTimestamp;

  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection = OrderDirection.Desc;

  @IsOptional()
  @IsEnum(DetailLevel)
  detail?: DetailLevel = DetailLevel.BASIC;
}
