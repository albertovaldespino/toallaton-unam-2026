import { db } from "@/lib/db";
import { authorized, failure, forbidden } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!authorized(req)) return forbidden();
  try {
    const all = new URL(req.url).searchParams.get("all") === "1";
    const sql = db();
    const rows = all
      ? await sql`SELECT id,sequence::text,site_id,site_name,quantity,donor,notes,created_at FROM donations WHERE deleted_at IS NULL ORDER BY sequence DESC`
      : await sql`SELECT id,sequence::text,site_id,site_name,quantity,donor,notes,created_at FROM donations WHERE deleted_at IS NULL ORDER BY sequence DESC LIMIT 100`;
    return Response.json(rows, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  if (!authorized(req)) return forbidden();
  try {
    const b = await req.json();
    if (
      !Number.isInteger(b.quantity) ||
      b.quantity <= 0 ||
      b.quantity > 2147483647 ||
      typeof b.site_id !== "string" ||
      typeof b.id !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(b.id) ||
      [b.donor, b.notes].some(
        (v) => v != null && (typeof v !== "string" || v.length > 1000),
      )
    )
      return Response.json(
        { error: "Verifica la sede y una cantidad entera mayor que cero." },
        { status: 400 },
      );
    const sql = db();
    const [, result] = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(20261001)`,
      sql`INSERT INTO donations(id,site_id,site_name,quantity,donor,notes) SELECT ${b.id}::uuid,id,name,${b.quantity},${b.donor || null},${b.notes || null} FROM sites WHERE id=${b.site_id} ON CONFLICT(id) DO NOTHING RETURNING id,site_id,site_name,quantity,created_at`,
    ]);
    if (!result.length) {
      const exists = await sql`SELECT id FROM donations WHERE id=${b.id}::uuid`;
      if (exists.length) return Response.json(exists[0]);
      return Response.json({ error: "La sede no existe." }, { status: 400 });
    }
    return Response.json(result[0], { status: 201 });
  } catch (e) {
    return failure(e);
  }
}
