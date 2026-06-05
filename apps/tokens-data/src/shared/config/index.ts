const rpcUrlFor = (chainId: number): string => {
  const url = process.env[`RPC_URL_${chainId}`];
  if (!url) throw new Error(`No RPC URL configured for chain ${chainId} (set RPC_URL_${chainId})`);
  return url;
};

export const config = {
  port: Number(process.env.PORT ?? 3100),
  rpc: { urlFor: rpcUrlFor },
};
