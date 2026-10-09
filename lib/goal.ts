export const DONATION_GOAL = 15000;
export const PREVIOUS_PUBLIC_GOAL = 20000;
export const PUBLIC_DONATION_GOAL = 22500;
export function goalProgress(total: number, goal = DONATION_GOAL, capPercent = true) {
  const safeTotal = Math.max(0, total);
  return {
    total: safeTotal,
    remaining: Math.max(0, goal - safeTotal),
    percent: capPercent ? Math.min(100, (safeTotal / goal) * 100) : (safeTotal / goal) * 100,
    reached: safeTotal >= goal,
    exceeded: safeTotal > goal,
  };
}
