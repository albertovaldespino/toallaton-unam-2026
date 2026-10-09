// Isolated adapter models PostgreSQL's output-alias ordering, never production.
import { expect, it, vi } from 'vitest';
vi.mock('@/lib/db', () => ({ db: () => {
  const rows = ['98', '99', '100', '101', '145'].map(sequence => ({
    id: `isolated-${sequence}`, sequence, site_name: `Sede ${sequence}`,
    quantity: 1, deleted_at: null,
  }));
  const sql = async (parts: TemplateStringsArray, ...values: unknown[]) => {
    const query = parts.join('?');
    if (query.includes('MAX(sequence)')) return [{ cursor: '145' }];
    if (query.includes('SUM(quantity)')) return [{ total: 5, count: 5 }];
    if (query.includes('FROM sites')) return [];
    // An unqualified ORDER BY sequence selects the sequence::text output alias.
    const numeric = query.includes('ORDER BY donations.sequence');
    const direction = query.includes(' DESC') ? -1 : 1;
    const result = rows.filter(row => !query.includes('sequence>') || BigInt(row.sequence) > BigInt(String(values[0])))
      .sort((a, b) => direction * (numeric
        ? (BigInt(a.sequence) < BigInt(b.sequence) ? -1 : 1)
        : a.sequence.localeCompare(b.sequence)));
    return query.includes('LIMIT 1') && !query.includes('LIMIT 100') ? result.slice(0, 1) : result;
  };
  sql.transaction = async (queries: Promise<unknown>[]) => Promise.all(queries);
  return sql;
}}));
vi.mock('@/lib/http', () => ({ authorized: () => true, forbidden: () => Response.json({}, { status: 401 }), failure: () => Response.json({}, { status: 503 }) }));
import { GET as stats } from '@/app/api/stats/route';
import { GET as events } from '@/app/api/donations/latest/route';
import { GET as history } from '@/app/api/donations/route';
it('latest contribution remains newest across the 99 to 100 boundary', async () => {
  const data = await (await stats()).json();
  expect(data.latest.sequence).toBe('145');
  expect(data.total).toBe(5);
});
it('event cursor advances chronologically instead of skipping events after 99', async () => {
  const data = await (await events(new Request('http://local/api/donations/latest?after=98'))).json();
  expect(data.events.map((row: {sequence: string}) => row.sequence)).toEqual(['99', '100', '101', '145']);
  expect(data.cursor).toBe('145');
});
it('both history modes list newest contributions first', async () => {
  for (const suffix of ['', '?all=1']) {
    const data = await (await history(new Request(`http://local/api/donations${suffix}`))).json();
    expect(data.map((row: {sequence: string}) => row.sequence)).toEqual(['145', '101', '100', '99', '98']);
  }
});
