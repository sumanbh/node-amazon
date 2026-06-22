import { Kysely, PostgresDialect } from 'kysely';
import { Migrator, FileMigrationProvider } from 'kysely/migration';
import pg from 'pg';
import fs from 'node:fs';
import { promises as fsPromises } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { generateTypes } from './generateTypes';

const { Pool, Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../config/amazon.json');
const { postgresql } = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const {
  user, password, host, port,
} = postgresql;
const postgresConfig = {
  user,
  password,
  host,
  port,
};

async function runMigrations() {
  const db = new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: new Pool({
        user,
        password,
        host,
        port,
        database: postgresql.database,
        max: 5,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: fsPromises,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  console.log(chalk.blue('Now running migrations via Kysely...'));
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(chalk.green(`Migration "${it.migrationName}" executed successfully`));
    } else if (it.status === 'Error') {
      console.error(chalk.red(`Failed to execute migration "${it.migrationName}"`));
    }
  });

  if (error) {
    console.error(chalk.red('Failed to migrate:'));
    console.error(error);
    await db.destroy();
    process.exit(1);
  }

  console.log(chalk.green('Successfully ran all migrations and seeded the database.'));
  await db.destroy();

  console.log(chalk.blue('Generating Kysely type definitions...'));
  try {
    await generateTypes();
  } catch (err) {
    console.error(chalk.red('Failed to generate types:'));
    console.error(err);
    process.exit(1);
  }

  process.exit(0);
}

(async function main() {
  try {
    console.log(chalk.green('Setting up the database...'));

    const client = new Client(postgresConfig);
    await client.connect();

    console.log(chalk.green('Dropping database if it exists:', postgresql.database));
    try {
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid();
      `, [postgresql.database]);
    } catch {
      // Ignore error if terminating connections fails or is not supported
    }
    await client.query(`DROP DATABASE IF EXISTS ${postgresql.database};`);

    console.log(chalk.green('Creating database:', postgresql.database));
    await client.query(`CREATE DATABASE ${postgresql.database};`);
    await client.end();

    console.log(chalk.green('Successfully created database:', postgresql.database));

    await runMigrations();
  } catch (err) {
    console.error(chalk.red('Error setting up the database:'));
    console.error(err);
    process.exit(1);
  }
}());
