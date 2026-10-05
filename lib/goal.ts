export const DONATION_GOAL = 15000;
export function goalProgress(total: number) {
  const safeTotal = Math.max(0, total);
  return {
    total: safeTotal,
    remaining: Math.max(0, DONATION_GOAL - safeTotal),
    percent: Math.min(100, (safeTotal / DONATION_GOAL) * 100),
    reached: safeTotal >= DONATION_GOAL,
    exceeded: safeTotal > DONATION_GOAL,
  };
}
