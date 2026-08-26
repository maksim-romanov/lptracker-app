// Network brand marks (inline SVG). Brand hexes are asset data, not theme tokens.
type Props = { chainId: number; size?: number };

const Ethereum = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <path fill="#627EEA" d="M16 4v8.87l7.5 3.35z" />
    <path fill="#8A92B2" d="M16 4 8.5 16.22 16 12.87z" />
    <path fill="#627EEA" d="M16 21.97V28l7.5-10.39z" />
    <path fill="#8A92B2" d="M16 28v-6.04L8.5 17.6z" />
    <path fill="#454A75" d="m16 20.57 7.5-4.35L16 12.87z" />
    <path fill="#62688F" d="M8.5 16.22 16 20.57v-7.7z" />
  </svg>
);

const Base = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="#0052FF" />
    <path fill="#fff" d="M15.5 7.5a8 8 0 1 0 8.4 9H12.6v-3h11.3a8 8 0 0 0-8.4-6z" />
  </svg>
);

const Arbitrum = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="#213147" />
    <path fill="#12AAFF" d="M16 7.5 21 16l-2.4 4L16 13l-2.6 7-2.4-4z" />
    <path fill="#9DCCED" d="m19.6 24.5-1.6-4 2.3-4 2.6 4.5z" />
  </svg>
);

export const NetworkLogo = ({ chainId, size = 16 }: Props) => {
  switch (chainId) {
    case 1:
      return <Ethereum size={size} />;
    case 8453:
      return <Base size={size} />;
    case 42161:
      return <Arbitrum size={size} />;
    default:
      return null;
  }
};
