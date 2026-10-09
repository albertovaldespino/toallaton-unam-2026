import { db } from "@/lib/db";
import { failure } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const sql = db();
    const [summary, sites, last] = await sql.transaction(
      [
        sql`SELECT COALESCE(SUM(quantity),0)::float8 AS total,COUNT(*)::int AS count FROM donations WHERE deleted_at IS NULL`,
        sql`SELECT s.id,s.name AS nombre,s.short_name AS "nombreCorto",s.latitude AS latitud,s.longitude AS longitud,s.state AS estado,s.city AS ciudad,COALESCE(SUM(d.quantity),0)::float8 AS total,COUNT(d.id)::int AS count FROM sites s LEFT JOIN donations d ON d.site_id=s.id AND d.deleted_at IS NULL GROUP BY s.id ORDER BY total DESC,s.name`,
        sql`SELECT id,sequence::text,site_id,site_name,quantity,donor,created_at FROM donations WHERE deleted_at IS NULL ORDER BY donations.sequence DESC LIMIT 1`,
      ],
      { isolationLevel: "RepeatableRead", readOnly: true },
    );
    return Response.json({ ...summary[0], sites, latest: last[0] || null }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (e) {
    return failure(e);
  }
}
