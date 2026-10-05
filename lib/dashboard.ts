import type { Donation } from "./types";
import type { Site } from "../data/sedes";
export function donationDashboard(donations: Donation[], sites: Site[]) {
  const totals = new Map(
    sites.map((s) => [
      s.id,
      { ...s, total: 0, count: 0, lastDonation: null as string | null },
    ]),
  );
  const days = new Map<string, number>();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  let total = 0;
  for (const d of donations) {
    total += d.quantity;
    const site = totals.get(d.site_id);
    if (site) {
      site.total += d.quantity;
      site.count++;
      if (!site.lastDonation || d.created_at > site.lastDonation)
        site.lastDonation = d.created_at;
    }
    const day = date.format(new Date(d.created_at));
    days.set(day, (days.get(day) || 0) + d.quantity);
  }
  let cumulative = 0;
  return {
    total,
    count: donations.length,
    average: donations.length ? total / donations.length : 0,
    sites: [...totals.values()].sort(
      (a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre),
    ),
    days: [...days]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, quantity]) => ({
        date,
        quantity,
        total: (cumulative += quantity),
      })),
  };
}
