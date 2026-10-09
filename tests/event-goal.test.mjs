import { test } from "node:test";
import assert from "node:assert/strict";
import { DONATION_GOAL, PUBLIC_DONATION_GOAL, goalProgress } from "../lib/goal.ts";
import { donationDashboard } from "../lib/dashboard.ts";
import { sedes } from "../data/sedes.ts";
test("goal boundary, over-goal totals and reversals", () => {
  assert.equal(DONATION_GOAL, 15000);
  assert.equal(goalProgress(7500).percent, 50);
  assert.equal(goalProgress(14999).remaining, 1);
  assert.equal(goalProgress(0).remaining, 15000);
  assert.equal(goalProgress(14999).reached, false);
  assert.deepEqual(goalProgress(15000), {
    total: 15000,
    remaining: 0,
    percent: 100,
    reached: true,
    exceeded: false,
  });
  assert.deepEqual(goalProgress(15500), {
    total: 15500,
    remaining: 0,
    percent: 100,
    reached: true,
    exceeded: true,
  });
  assert.equal(goalProgress(14999).reached, false);
});
test("optional stretch-goal calculation remains available without changing base progress", () => {
  assert.equal(PUBLIC_DONATION_GOAL, 22500);
  for (const [total, percent] of [[11250, 50], [22500, 100], [22725, 101], [23625, 105], [27000, 120], [67500, 300]]) {
    const progress = goalProgress(total, PUBLIC_DONATION_GOAL, false);
    assert.equal(progress.total, total);
    assert.equal(progress.percent, percent);
    assert.equal(progress.remaining, Math.max(0, 22500 - total));
    assert.equal(progress.reached, total >= 22500);
  }
  assert.equal(goalProgress(19999, PUBLIC_DONATION_GOAL, false).reached, false);
  // The administration report retains its previous goal and capped percentage.
  assert.equal(goalProgress(24000).percent, 100);
});
test("dashboard includes more than 100 records, real sums and Mexico City dates", () => {
  const records = Array.from({ length: 125 }, (_, i) => ({
    id: String(i),
    sequence: String(i),
    site_id: sedes[0].id,
    site_name: sedes[0].nombre,
    quantity: 10,
    created_at: "2026-10-02T01:00:00.000Z",
    donor: null,
    notes: null,
  }));
  const data = donationDashboard(records, sedes);
  assert.equal(data.count, 125);
  assert.equal(data.total, 1250);
  assert.equal(data.average, 10);
  assert.equal(data.sites.length, 17);
  assert.equal(data.sites[0].count, 125);
  assert.equal(data.days[0].date, "2026-10-01");
  assert.equal(data.days[0].total, 1250);
  assert.equal(donationDashboard([], sedes).average, 0);
});
