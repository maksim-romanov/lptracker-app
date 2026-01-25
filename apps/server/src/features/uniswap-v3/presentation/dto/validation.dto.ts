import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsEthereumAddress, IsInt, IsNumberString, IsOptional, Max, Min } from "class-validator";

export enum SupportedChainId {
  MAINNET = 1,
  ARBITRUM = 42161,
}

export class WalletAddressParamDto {
  @IsEthereumAddress()
  walletAddress!: string;
}

export class ChainPositionParamDto {
  @Transform(({ value }) => Number(value))
  @IsEnum(SupportedChainId, {
    message: `chainId must be one of: ${Object.values(SupportedChainId).join(", ")}`,
  })
  chainId!: number;

  @IsNumberString({}, { message: "id must be a numeric string" })
  id!: string;
}

export class GetWalletPositionsQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  closed: boolean = false;
}
