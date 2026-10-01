import { db } from "@/lib/db";
import { authorized, failure, forbidden } from "@/lib/http";
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!authorized(req)) return forbidden();
  try {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id))
      return Response.json({ error: "Registro inválido" }, { status: 400 });
    const rows =
      await db()`UPDATE donations SET deleted_at=now() WHERE id=${id}::uuid AND deleted_at IS NULL AND sequence=(SELECT MAX(sequence) FROM donations WHERE deleted_at IS NULL) RETURNING id`;
    return rows.length
      ? Response.json({ ok: true })
      : Response.json(
          { error: "El último registro cambió. Actualiza el historial." },
          { status: 409 },
        );
  } catch (e) {
    return failure(e);
  }
}
