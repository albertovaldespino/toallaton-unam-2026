import { neon } from '@neondatabase/serverless';
import { existsSync } from 'node:fs';
import { databaseConfig } from '../lib/database-config.ts';
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
try {
  const config = databaseConfig();
  const sql = neon(config.connectionString);
  await sql`SELECT 1`;
  const tables = await sql`SELECT to_regclass('public.sites') IS NOT NULL AS sites, to_regclass('public.donations') IS NOT NULL AS donations`;
  console.log(`Conexión correcta mediante ${config.name}.`);
  if (!tables[0].sites || !tables[0].donations) {
    console.error('Faltan tablas. Ejecuta npm run db:migrate.');
    process.exitCode = 1;
  } else {
    const result = await sql`SELECT count(*)::int AS count FROM sites`;
    console.log(`Esquema disponible: ${result[0].count} sedes.`);
  }
} catch (error) {
  const allowed = ['DATABASE_NOT_CONFIGURED', 'DATABASE_CONNECTION_INVALID'];
  console.error(allowed.includes(error?.message) ? error.message : 'DATABASE_CHECK_FAILED');
  process.exitCode = 1;
}
