const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@172.18.0.3:5432/cvisor_db"
});
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const migrationFile = path.join(__dirname, '../migrations/004_add_status_and_variants.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    console.log('Running migration...');
    await pool.query(sql);
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
