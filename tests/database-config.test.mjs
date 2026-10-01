import { test } from 'node:test';
import assert from 'node:assert/strict';
import { databaseConfig } from '../lib/database-config.ts';
const pooled = 'postgresql://test:fake@pooled.invalid/db?sslmode=require';
const direct = 'postgresql://test:fake@direct.invalid/db?sslmode=require';
test('uses Neon integration variables without manual configuration',()=>{
 const env={DATABASE_URL:pooled,DATABASE_URL_UNPOOLED:direct};
 assert.equal(databaseConfig(env).connectionString,pooled);
 assert.equal(databaseConfig(env,true).connectionString,direct);
});
test('supports legacy Vercel Postgres and unpooled-only environments',()=>{
 assert.equal(databaseConfig({DATABASE_URL:' ',POSTGRES_URL:pooled}).name,'POSTGRES_URL');
 assert.equal(databaseConfig({DATABASE_URL_UNPOOLED:direct}).connectionString,direct);
});
test('fails closed without leaking invalid connection strings',()=>{
 assert.throws(()=>databaseConfig({}),/^Error: DATABASE_NOT_CONFIGURED$/);
 assert.throws(()=>databaseConfig({DATABASE_URL:'secret-invalid',POSTGRES_URL:pooled}),/^Error: DATABASE_CONNECTION_INVALID$/);
});
