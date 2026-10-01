import { neon } from '@neondatabase/serverless';
import { databaseConfig } from './database-config';
export function db() {
  return neon(databaseConfig().connectionString);
}
