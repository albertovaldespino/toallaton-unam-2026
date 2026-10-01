import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (!process.env.DATABASE_URL)
  throw Error("Configura DATABASE_URL en .env.local");
const sql = neon(process.env.DATABASE_URL);
for (const statement of readFileSync("scripts/schema.sql", "utf8")
  .split(";")
  .filter((s) => s.trim()))
  await sql.query(statement);
const { sedes } = await import("../data/sedes.ts");
for (const s of sedes)
  await sql`INSERT INTO sites(id,name,short_name,latitude,longitude,state,city) VALUES(${s.id},${s.nombre},${s.nombreCorto},${s.latitud},${s.longitud},${s.estado},${s.ciudad}) ON CONFLICT(id) DO NOTHING`;
console.log("Esquema listo; 17 sedes iniciales disponibles.");
