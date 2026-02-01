const { pool } = require('./db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function resetDb() {
  console.log("\n⚠️  ATENȚIE: ACEASTĂ ACȚIUNE VA ȘTERGE TOATE DATELE DIN BAZA DE DATE! ⚠️\n");
  const answer = await ask("Ești sigur că vrei să continui? Scrie 'DA' pentru a confirma: ");

  if (answer !== 'DA') {
    console.log("Operațiune anulată.");
    process.exit(0);
  }

  const client = await pool.connect();
  try {
    console.log("Se șterg datele...");
    await client.query("BEGIN");

    // Varianta dinamică și mai sigură:
    // 1. Aflăm toate tabelele din schema public
    const res = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != 'pg_stat_statements'
    `);

    if (res.rows.length === 0) {
      console.log("Nu am găsit tabele de șters.");
    } else {
      // 2. Construim comanda TRUNCATE pentru TOATE tabelele simultan
      // Folosind CASCADE, ordinea nu mai contează așa mult pentru FK
      const tables = res.rows.map(row => `"${row.tablename}"`).join(', ');

      console.log(`Se vor goli următoarele tabele: ${tables}`);

      await client.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
    }

    await client.query("COMMIT");
    console.log("\n✅ Baza de date a fost curățată cu succes! (Toate tabelele au fost golite)");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Eroare la resetarea bazei de date:", err);
  } finally {
    client.release();
    rl.close();
    process.exit(0);
  }
}

resetDb();
