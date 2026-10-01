import { db } from "@/lib/db";
import { failure } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const after = new URL(req.url).searchParams.get("after");
    if (after !== null && !/^\d+$/.test(after))
      return Response.json({ error: "Cursor inválido" }, { status: 400 });
    const sql = db();
    if (after === null) {
      const rows =
        await sql`SELECT COALESCE(MAX(sequence),0)::text AS cursor FROM donations`;
      return Response.json({ cursor: rows[0].cursor, events: [] });
    }
    const events =
      await sql`SELECT id,sequence::text,site_id,site_name,quantity,created_at,deleted_at FROM donations WHERE sequence>${after}::bigint ORDER BY sequence ASC LIMIT 100`;
    return Response.json({
      cursor: events.at(-1)?.sequence || after,
      events: events
        .filter((e) => !e.deleted_at)
        .map(({ deleted_at, ...e }) => e),
    });
  } catch (e) {
    return failure(e);
  }
}
