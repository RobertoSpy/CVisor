const { pool } = require('./db');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function createOrg() {
  try {
    console.log("\n🏢 CVISOR Organization Creator 🏢\n");
    console.log("Acest utilitar creează conturi de organizație verificate direct în baza de date.\n");

    const fullName = await ask("Nume Organizație: ");
    if (!fullName) throw new Error("Numele este obligatoriu!");

    const email = await ask("Email Login: ");
    if (!email || !email.includes('@')) throw new Error("Email invalid!");

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) throw new Error("Acest email există deja!");

    const password = await ask("Parolă: ");
    if (password.length < 6) throw new Error("Parola trebuie să aibă minim 6 caractere!");

    const hashedPassword = await bcrypt.hash(password, 12);

    // Creează User
    const userRes = await pool.query(
      `INSERT INTO users (full_name, email, password, role, is_verified, created_at)
       VALUES ($1, $2, $3, 'organization', true, NOW())
       RETURNING id`,
      [fullName, email, hashedPassword]
    );
    const userId = userRes.rows[0].id;

    // Creează Profil Gol (pentru a evita erori la login/profil)
    await pool.query(
      `INSERT INTO organization_profiles (user_id, name, updated_at) VALUES ($1, $2, NOW())`,
      [userId, fullName]
    );

    console.log(`\n✅ SUCCES: Contul de organizație '${fullName}' (${email}) a fost creat!`);
    console.log("Te poți autentifica imediat în aplicație.");

  } catch (err) {
    console.error("\n❌ EROARE:", err.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createOrg();
