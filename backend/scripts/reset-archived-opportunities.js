/**
 * Script pentru resetare oportunități arhivate greșit
 * Usage: node scripts/reset-archived-opportunities.js
 */

require('dotenv').config();
const { pool } = require('../db');

async function resetArchivedOpportunities() {
  try {
    console.log('\n🔍 Verificare oportunități arhivate...\n');

    // 1. Verifică toate oportunitățile
    const { rows: all } = await pool.query(`
      SELECT id, title, deadline, status, created_at
      FROM opportunities
      ORDER BY deadline DESC
    `);

    console.log('📊 Toate oportunitățile:');
    console.table(all.map(o => ({
      ID: o.id,
      Titlu: o.title.substring(0, 30),
      Deadline: o.deadline ? o.deadline.toISOString().split('T')[0] : 'NULL',
      Status: o.status,
      Creat: o.created_at.toISOString().split('T')[0]
    })));

    // 2. Numără câte sunt archived
    const { rows: stats } = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM opportunities
      GROUP BY status
    `);

    console.log('\n📈 Statistici status:');
    console.table(stats);

    // 3. Întreabă dacă vrei să resetezi
    const { rows: archived } = await pool.query(`
      SELECT id, title, deadline
      FROM opportunities
      WHERE status = 'archived'
    `);

    if (archived.length === 0) {
      console.log('\n✅ Nu există oportunități arhivate. Totul e OK!\n');
      return;
    }

    console.log(`\n⚠️  Găsite ${archived.length} oportunități ARCHIVED`);
    console.log('Vrei să le resetezi la ACTIVE? (Editează scriptul și decomentează linia)\n');

    // DECOMENTEAZĂ URMĂTOAREA LINIE PENTRU A RESETA:
    // await resetToActive();

  } catch (error) {
    console.error('\n❌ Eroare:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

async function resetToActive() {
  console.log('\n🔄 Resetare oportunități la ACTIVE...');

  const result = await pool.query(`
    UPDATE opportunities
    SET status = 'active'
    WHERE status = 'archived'
    RETURNING id, title
  `);

  console.log(`\n✅ ${result.rowCount} oportunități resetate la ACTIVE:`);
  result.rows.forEach(r => {
    console.log(`   - [${r.id}] ${r.title}`);
  });

  console.log('\n💡 Recomandare: Actualizează deadline-urile pentru a evita re-arhivarea automată!');
  console.log('   Rulează: node scripts/update-deadlines.js\n');
}

// Rulează
resetArchivedOpportunities();
