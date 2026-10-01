import { neon } from "@neondatabase/serverless";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function check() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    console.error("Falta configurar DATABASE_URL en .env.local.");
    process.exitCode = 1;
    return;
  }
  try {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error();
  } catch {
    console.error("DATABASE_URL no tiene un formato PostgreSQL válido. Revisa el archivo local.");
    process.exitCode = 1;
    return;
  }
  try {
    const sql = neon(value);
    await sql`SELECT 1 AS connected`;
    console.log("Conexión a PostgreSQL correcta. No se modificaron registros.");
  } catch {
    console.error("No fue posible conectar. Revisa DATABASE_URL, el estado de Neon y la conexión de red. Los detalles se omiten para proteger las credenciales.");
    process.exitCode = 1;
  }
}
await check();
