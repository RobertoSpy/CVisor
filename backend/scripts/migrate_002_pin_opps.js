const { Pool } = require('pg');
require('dotenv').config(); // Load from current dir (backend/.env)

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes('@postgres:')) {
  console.log("Replacing 'postgres' host with 'localhost' for local migration...");
  connectionString = connectionString.replace('@postgres:', '@localhost:');
}

const pool = new Pool({
  connectionString,
});

async function migrate() {
  try {
    console.log("Running migration: Add is_pinned_on_profile to opportunities...");
    await pool.query(`
      ALTER TABLE opportunities 
      ADD COLUMN IF NOT EXISTS is_pinned_on_profile BOOLEAN DEFAULT FALSE;
    `);
    console.log("Migration successful!");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await pool.end();
  }
}

migrate();
