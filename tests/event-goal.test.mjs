import { test } from "node:test";
import assert from "node:assert/strict";
import { goalProgress } from "../lib/goal.ts";
import { donationDashboard } from "../lib/dashboard.ts";
import { sedes } from "../data/sedes.ts";
test("goal boundary, over-goal totals and reversals", () => {
  assert.equal(goalProgress(0).remaining, 12001);
  assert.equal(goalProgress(12000).reached, false);
  assert.deepEqual(goalProgress(12001), {
    total: 12001,
    remaining: 0,
    percent: 100,
    reached: true,
    exceeded: false,
  });
  assert.deepEqual(goalProgress(12500), {
    total: 12500,
    remaining: 0,
    percent: 100,
    reached: true,
    exceeded: true,
  });
  assert.equal(goalProgress(11900).reached, false);
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
