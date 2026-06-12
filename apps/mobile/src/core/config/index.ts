import { EMembership } from "membership/domain/entities/membership.entity";

const gatewayUrl = process.env.EXPO_PUBLIC_API_URL;
if (!gatewayUrl) throw new Error("Missing env: EXPO_PUBLIC_API_URL");

const membershipRaw = process.env.EXPO_PUBLIC_MEMBERSHIP ?? EMembership.FREE;
const membershipValues = Object.values(EMembership) as string[];
if (!membershipValues.includes(membershipRaw)) {
  throw new Error(`Invalid EXPO_PUBLIC_MEMBERSHIP: ${membershipRaw}. Allowed: ${membershipValues.join(", ")}`);
}

export const config = {
  api: {
    gateway: { baseUrl: gatewayUrl },
  },
  membership: {
    current: membershipRaw as EMembership,
  },
};
