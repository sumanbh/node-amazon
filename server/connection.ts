import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Database } from './database.types';

const configPath = path.resolve(process.cwd(), 'config/amazon.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

export const pool = new pg.Pool({
  ...config.postgresql,
  max: 15,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});
