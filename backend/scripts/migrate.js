#!/usr/bin/env node
/**
 * Migration Runner — CVisor Backend
 * 
 * Tracks which SQL migrations have been applied using a `schema_migrations` table.
 * 
 * Usage:
 *   node scripts/migrate.js            — Apply all pending migrations
 *   node scripts/migrate.js --status   — Show what's applied vs pending
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

/** Ensure the schema_migrations tracking table exists. */
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     VARCHAR(255) PRIMARY KEY,
      filename    VARCHAR(255) NOT NULL,
      applied_at  TIMESTAMP DEFAULT NOW(),
      checksum    VARCHAR(64)
    )
  `);
}

/** Get set of already-applied migration versions from DB. */
async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  );
  return new Set(rows.map(r => r.version));
}

/**
 * Get ordered list of .sql migration files.
 * Only includes files starting with a digit (e.g. 00_init.sql, 01_badges.sql).
 */
function getMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && /^\d/.test(f))
    .sort();
}

/** SHA-256 checksum of migration file content. */
function computeChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 64);
}

/** Apply a single migration file inside a transaction. */
async function applyMigration(client, filename) {
  const version = filename.replace('.sql', '');
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const checksum = computeChecksum(content);

  console.log(`  ⏳ Applying: ${filename}...`);

  await client.query('BEGIN');
  try {
    await client.query(content);
    await client.query(
      'INSERT INTO schema_migrations (version, filename, checksum) VALUES ($1, $2, $3)',
      [version, filename, checksum]
    );
    await client.query('COMMIT');
    console.log(`  ✅ Applied: ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  ❌ Failed: ${filename} — ${err.message}`);
    throw err;
  }
}

/** Show status of all migrations (applied vs pending). */
async function showStatus(files, applied) {
  console.log('\n📋 Migration Status:\n');
  console.log('  Filename                               | Status');
  console.log('  ----------------------------------------|----------');
  for (const file of files) {
    const version = file.replace('.sql', '');
    const status = applied.has(version) ? '✅ Applied' : '⏳ Pending';
    console.log(`  ${file.padEnd(40)}| ${status}`);
  }
  const pending = files.filter(f => !applied.has(f.replace('.sql', ''))).length;
  console.log(`\n  ${files.length} total | ${applied.size} applied | ${pending} pending\n`);
}

async function main() {
  const isStatus = process.argv.includes('--status');
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const files = getMigrationFiles();
    const applied = await getAppliedMigrations(client);

    if (isStatus) {
      await showStatus(files, applied);
      return;
    }

    const pending = files.filter(f => !applied.has(f.replace('.sql', '')));

    if (pending.length === 0) {
      console.log('\n✅ All migrations are up to date!\n');
      return;
    }

    console.log(`\n🚀 Running ${pending.length} pending migration(s)...\n`);
    for (const file of pending) {
      await applyMigration(client, file);
    }
    console.log(`\n✅ Done! ${pending.length} migration(s) applied.\n`);

  } catch (err) {
    console.error('\n❌ Migration runner failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
