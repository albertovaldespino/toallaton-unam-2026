import { db } from "@/lib/db";
import { authorized, failure, forbidden } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(
      await db()`SELECT id,name AS nombre,short_name AS "nombreCorto",latitude AS latitud,longitude AS longitud,state AS estado,city AS ciudad FROM sites ORDER BY name`,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  if (!authorized(req)) return forbidden();
  try {
    const b = await req.json();
    const fields = ["nombre", "nombreCorto", "estado", "ciudad"];
    if (
      fields.some(
        (k) => typeof b[k] !== "string" || !b[k].trim() || b[k].length > 150,
      ) ||
      !Number.isFinite(b.latitud) ||
      !Number.isFinite(b.longitud) ||
      Math.abs(b.latitud) > 90 ||
      Math.abs(b.longitud) > 180
    )
      return Response.json(
        { error: "Completa los datos y utiliza coordenadas válidas." },
        { status: 400 },
      );
    const id = crypto.randomUUID();
    await db()`INSERT INTO sites(id,name,short_name,latitude,longitude,state,city) VALUES(${id},${b.nombre.trim()},${b.nombreCorto.trim()},${b.latitud},${b.longitud},${b.estado.trim()},${b.ciudad.trim()})`;
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    return failure(e);
  }
}
