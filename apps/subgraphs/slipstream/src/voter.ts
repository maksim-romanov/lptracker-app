import { Address, dataSource } from "@graphprotocol/graph-ts";

import { GaugeCreated } from "../generated/Voter/Voter";
import { CLGauge } from "../generated/templates";

// The Voter also creates gauges for basic (v2) pools and for older Slipstream deployments.
// Only spawn a template for gauges whose pool comes from the CLFactory that mints the pools
// behind the NonfungiblePositionManager this subgraph indexes — which differs per network.
function clPoolFactory(): Address {
  if (dataSource.network() == "optimism") {
    return Address.fromString("0xe13Dd1fbA721Aa81a1826D9523AC9BC7d260c879");
  }
  return Address.fromString("0xf8f2eB4940CFE7d13603DDDD87f123820Fc061Ef");
}

export function handleGaugeCreated(event: GaugeCreated): void {
  if (!event.params.poolFactory.equals(clPoolFactory())) {
    return;
  }
  CLGauge.create(event.params.gauge);
}
