import { Deposit, Withdraw } from "../generated/templates/CLGauge/CLGauge";
import { Position } from "../generated/schema";

export function handleDeposit(event: Deposit): void {
  let position = Position.load(event.params.tokenId.toString());
  if (position == null) {
    return;
  }

  // The preceding NFPM Transfer set `owner` to the gauge; restore the real staker.
  position.owner = event.params.user;
  position.staked = true;
  position.gauge = event.address;
  position.updatedAtBlock = event.block.number;
  position.updatedAtTimestamp = event.block.timestamp;
  position.save();
}

export function handleWithdraw(event: Withdraw): void {
  let position = Position.load(event.params.tokenId.toString());
  if (position == null) {
    return;
  }

  position.owner = event.params.user;
  position.staked = false;
  position.gauge = null;
  position.updatedAtBlock = event.block.number;
  position.updatedAtTimestamp = event.block.timestamp;
  position.save();
}
