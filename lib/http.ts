import { timingSafeEqual } from "node:crypto";
export function authorized(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  const actual = req.headers.get("x-admin-password") || "";
  return (
    !!expected &&
    Buffer.byteLength(actual) === Buffer.byteLength(expected) &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  );
}
export function failure(error: unknown) {
  console.error(
    error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
      ? "DATABASE_NOT_CONFIGURED"
      : "DATABASE_REQUEST_FAILED",
  );
  return Response.json(
    {
      error:
        "No fue posible conectar con la base de datos. Se conservará el último estado disponible.",
    },
    { status: 503 },
  );
}
export const forbidden = () =>
  Response.json(
    { error: "Introduce la clave de administración correcta." },
    { status: 401 },
  );
