/**
 * Script pentru actualizare deadline-uri în viitor
 * Usage: node scripts/update-deadlines.js
 */

require('dotenv').config();
const { pool } = require('../db');

async function updateDeadlines() {
  try {
    console.log('\n📅 Actualizare deadline-uri...\n');

    // Setează toate deadline-urile la 30 zile în viitor
    const result = await pool.query(`
      UPDATE opportunities
      SET deadline = CURRENT_DATE + INTERVAL '30 days'
      WHERE deadline < CURRENT_DATE OR deadline IS NULL
      RETURNING id, title, deadline
    `);

    if (result.rowCount === 0) {
      console.log('✅ Toate deadline-urile sunt deja în viitor!\n');
      return;
    }

    console.log(`✅ ${result.rowCount} oportunități actualizate cu deadline +30 zile:`);
    result.rows.forEach(r => {
      console.log(`   - [${r.id}] ${r.title} → ${r.deadline.toISOString().split('T')[0]}`);
    });

    console.log('\n✨ Gata! Oportunitățile nu vor mai fi arhivate automat pentru 30 zile.\n');

  } catch (error) {
    console.error('\n❌ Eroare:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Rulează
updateDeadlines();
