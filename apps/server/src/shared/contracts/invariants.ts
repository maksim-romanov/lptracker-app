import { FEE_ACCRUAL_MODES } from "@depthly/catalog";

import type { Position } from "./position.schema";

const CLAIMABLE = FEE_ACCRUAL_MODES.claimable;

// An owed balance only belongs in `tokens` when the owner can actually collect it. Under any
// other disposition the same value is already counted somewhere else — inside principal for
// "compounded", in someone else's balance for "redirected" — so listing it again overstates
// the position by exactly that amount, every poll, with nothing on the wire to detect it.
const assertOwedTokensMatchDisposition = ({ ref, feeAccrual, tokens }: Position): void => {
  if (feeAccrual.mode === CLAIMABLE) return;

  const owedToken = tokens.find((token) => token.role === "owed");
  if (!owedToken) return;

  throw new Error(
    `Position ${ref}: feeAccrual.mode is "${feeAccrual.mode}" but the position lists an owed token (${owedToken.tokenRef}). ` +
      `An owed entry asserts the owner can collect that amount, which only "${CLAIMABLE}" means. ` +
      `Either drop the owed tokens or state the disposition that makes them collectable.`,
  );
};

// A protocol that expands a wrapper or a metapool into its underlying tokens can emit the
// same token twice; a consumer summing principal then counts it twice.
const assertOnePrincipalEntryPerToken = ({ ref, tokens }: Position): void => {
  const seen = new Set<string>();

  for (const token of tokens) {
    if (token.role !== "principal") continue;
    if (seen.has(token.tokenRef)) {
      throw new Error(
        `Position ${ref}: two principal entries for ${token.tokenRef}. ` +
          `Sum the underlying amounts into one entry — a consumer adding up principal has no way to tell a duplicate from a second leg.`,
      );
    }
    seen.add(token.tokenRef);
  }
};

// Bounds follow the pool's own token order and are never pre-inverted, so a reversed pair is
// the signature of a mapper that encoded a client's display preference. A client placing a
// range bar from reversed bounds draws it backwards and reads in-range as out.
const assertRangeBoundsAreOrdered = ({ ref, range }: Position): void => {
  if (range === null || range.lower === null || range.upper === null) return;

  const lower = Number(range.lower);
  const upper = Number(range.upper);
  if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower <= upper) return;

  throw new Error(
    `Position ${ref}: range.lower (${range.lower}) is above range.upper (${range.upper}). ` +
      `Emit the bounds in the pool's own token order and leave inversion to the client, which is 1/x plus swapping them.`,
  );
};

/**
 * Throws when a position's fields contradict each other in a way that overstates a balance.
 *
 * Meant for a producer's tests. Calling it on the serving path would turn a data bug into an
 * outage: this server degrades one failing protocol rather than failing the whole request,
 * and a thrown invariant would take the healthy protocols down with it.
 */
export const assertPositionInvariants = (position: Position): void => {
  assertOwedTokensMatchDisposition(position);
  assertOnePrincipalEntryPerToken(position);
  assertRangeBoundsAreOrdered(position);
};
