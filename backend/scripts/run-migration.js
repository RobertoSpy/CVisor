/**
 * Script pentru rularea manuală a migrărilor
 * Usage: node scripts/run-migration.js <migration_file>
 *
 * Exemple:
 *   node scripts/run-migration.js 01_badges_normalization.sql
 *   node scripts/run-migration.js 01_badges_normalization_rollback.sql
 */

const { pool } = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration(filename) {
  const migrationPath = path.join(__dirname, '../migrations', filename);

  console.log(`\n🚀 Rulare migrare: ${filename}\n`);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Fișierul nu există: ${migrationPath}`);
    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 SQL citit cu succes. Începe execuția...\n');

    const result = await pool.query(sql);

    console.log('✅ Migrare executată cu succes!\n');

    // Afișează NOTICES din PostgreSQL (RAISE NOTICE)
    if (result.notices && result.notices.length > 0) {
      console.log('📢 Notificări PostgreSQL:');
      result.notices.forEach(notice => {
        console.log(`   ${notice.message}`);
      });
    }

    // Validare: Verifică tabela badges
    const { rows } = await pool.query("SELECT COUNT(*) as count FROM badges");
    console.log(`\n📊 Tabela badges conține ${rows[0].count} badge-uri definite`);

    // Verifică user_badges structure
    const { rows: columns } = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_badges'
      ORDER BY ordinal_position
    `);

    console.log('\n🔍 Structură user_badges:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Verifică FK constraints
    const { rows: constraints } = await pool.query(`
      SELECT conname, contype
      FROM pg_constraint
      WHERE conrelid = 'user_badges'::regclass
    `);

    console.log('\n🔗 Constraints user_badges:');
    constraints.forEach(c => {
      const type = c.contype === 'f' ? 'FOREIGN KEY' : c.contype === 'u' ? 'UNIQUE' : c.contype;
      console.log(`   - ${c.conname} (${type})`);
    });

    console.log('\n✨ MIGRARE COMPLETĂ!\n');

  } catch (error) {
    console.error('\n❌ EROARE la rularea migrării:');
    console.error(error.message);
    console.error('\nDetalii complete:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Main
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration_file>');
  console.error('\nExemple:');
  console.error('  node scripts/run-migration.js 01_badges_normalization.sql');
  console.error('  node scripts/run-migration.js 01_badges_normalization_rollback.sql');
  process.exit(1);
}

runMigration(migrationFile);
