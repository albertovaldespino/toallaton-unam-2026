/** Server-only connection selection. Never return this result from an API. */
export function databaseConfig(
  env: Record<string, string | undefined> = process.env,
  migration = false,
) {
  const names = migration
    ? ['DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING', 'DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL']
    : ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING'];
  for (const name of names) {
    const value = env[name]?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || url.pathname.length <= 1) throw new Error();
    } catch {
      throw new Error('DATABASE_CONNECTION_INVALID');
    }
    return { name, connectionString: value };
  }
  throw new Error('DATABASE_NOT_CONFIGURED');
}
