export enum EMembership {
  FREE = "free",
  PRO = "pro",
  ADMIN = "admin",
}

export const UNLIMITED = -1;

export type TMembershipLimits = {
  maxWallets: number;
};

const DEFAULT_LIMITS: Record<EMembership, TMembershipLimits> = {
  [EMembership.FREE]: { maxWallets: 2 },
  [EMembership.PRO]: { maxWallets: 4 },
  [EMembership.ADMIN]: { maxWallets: UNLIMITED },
};

export class Membership {
  constructor(
    public readonly id: EMembership,
    public readonly limits: TMembershipLimits,
  ) {}

  static byId(id: EMembership): Membership {
    return new Membership(id, DEFAULT_LIMITS[id]);
  }

  canAddWallet(currentCount: number): boolean {
    const { maxWallets } = this.limits;
    return maxWallets === UNLIMITED || currentCount < maxWallets;
  }
}
