import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Kysely, sql } from 'kysely';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function up(db: Kysely<unknown>): Promise<void> {
  const insertsPath = path.join(__dirname, 'inserts.sql');
  const inserts = fs.readFileSync(insertsPath, { encoding: 'utf8' });
  const insertsArray = inserts.split('--statement--');

  for (const stmtRaw of insertsArray) {
    const stmt = stmtRaw.trim();
    if (stmt) {
      await sql.raw(stmt).execute(db);
    }
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`TRUNCATE TABLE cart, orders, orderline, laptops, storage_type, brand, processor, os, customers CASCADE;`.execute(db);
}
