import { Address } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/Factory/ERC20";
import { Token } from "../../generated/schema";

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let result = contract.try_symbol();
  if (result.reverted) {
    return "UNKNOWN";
  }
  return result.value;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let result = contract.try_name();
  if (result.reverted) {
    return "Unknown Token";
  }
  return result.value;
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  let contract = ERC20.bind(tokenAddress);
  let result = contract.try_decimals();
  if (result.reverted) {
    return 18;
  }
  return result.value;
}

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());
  if (token == null) {
    token = new Token(address.toHexString());
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);
    token.decimals = fetchTokenDecimals(address);
    token.save();
  }
  return token;
}
