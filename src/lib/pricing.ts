export type PayablePlan = "Starter" | "Pro";

export interface PlanPrice {
  monthly: number;
  yearly: number;
}

// Single source of truth for what each paid plan actually costs - the
// marketing page and the Paystack checkout both read from here, so the
// price a visitor sees is guaranteed to be the price they're charged.
// Enterprise has no fixed price (contact sales) and Free is free, so
// neither is payable through self-serve checkout.
export const PLAN_PRICES: Record<PayablePlan, PlanPrice> = {
  Starter: {
    monthly: 15000,
    yearly: 150000, // 10x monthly - 2 months free
  },
  Pro: {
    monthly: 35000,
    yearly: 350000,
  },
};

export function isPayablePlan(plan: unknown): plan is PayablePlan {
  return plan === "Starter" || plan === "Pro";
}

export function getPlanAmount(plan: PayablePlan, billing: "monthly" | "yearly"): number {
  return PLAN_PRICES[plan][billing];
}
