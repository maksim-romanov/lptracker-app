import { Address, Bytes } from "@graphprotocol/graph-ts";

import { ERC20 } from "../../generated/NonfungiblePositionManager/ERC20";
import { ERC20SymbolBytes } from "../../generated/NonfungiblePositionManager/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../generated/NonfungiblePositionManager/ERC20NameBytes";
import { Token } from "../../generated/schema";

// Decode a bytes32 token symbol/name: trim trailing null padding, then UTF-8 decode.
function bytes32ToString(value: Bytes): string {
  let length = value.length;
  while (length > 0 && value[length - 1] == 0) {
    length--;
  }
  let trimmed = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    trimmed[i] = value[i];
  }
  return Bytes.fromUint8Array(trimmed).toString();
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let result = contract.try_symbol();
  if (!result.reverted) {
    return result.value;
  }

  // Some legacy tokens (e.g. MKR, DGD) return bytes32 instead of string.
  let bytesContract = ERC20SymbolBytes.bind(tokenAddress);
  let bytesResult = bytesContract.try_symbol();
  if (!bytesResult.reverted) {
    let decoded = bytes32ToString(bytesResult.value);
    if (decoded.length > 0) {
      return decoded;
    }
  }
  return "UNKNOWN";
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let result = contract.try_name();
  if (!result.reverted) {
    return result.value;
  }

  let bytesContract = ERC20NameBytes.bind(tokenAddress);
  let bytesResult = bytesContract.try_name();
  if (!bytesResult.reverted) {
    let decoded = bytes32ToString(bytesResult.value);
    if (decoded.length > 0) {
      return decoded;
    }
  }
  return "Unknown Token";
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
  let tokenId = Bytes.fromHexString(address.toHexString());
  let token = Token.load(tokenId);
  if (token == null) {
    token = new Token(tokenId);
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);
    token.decimals = fetchTokenDecimals(address);
    token.save();
  }
  return token;
}
