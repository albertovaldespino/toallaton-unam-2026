import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'node:fs';
import { databaseConfig } from '../lib/database-config.ts';
import { sedes } from '../data/sedes.ts';
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
try {
  const config = databaseConfig(process.env, true);
  const sql = neon(config.connectionString);
  const statements = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8').split(';').filter(s => s.trim());
  await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(20261002)`,
    ...statements.map(s => sql.query(s)),
    ...sedes.map(s => sql`INSERT INTO sites(id,name,short_name,latitude,longitude,state,city) VALUES(${s.id},${s.nombre},${s.nombreCorto},${s.latitud},${s.longitud},${s.estado},${s.ciudad}) ON CONFLICT(id) DO NOTHING`),
  ]);
  console.log(`Migración correcta mediante ${config.name}: tablas y 17 sedes iniciales verificadas, sin sobrescribir registros existentes.`);
} catch (error) {
  console.error(['DATABASE_NOT_CONFIGURED', 'DATABASE_CONNECTION_INVALID'].includes(error?.message) ? error.message : 'DATABASE_MIGRATION_FAILED');
  process.exitCode = 1;
}
