const { pool } = require('../db');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
  try {
    console.log("\n🛡️ CVISOR Admin Creator 🛡️\n");
    console.log("Acest utilitar creează conturi de administrator.\n");
    console.log("⚠️ ATENȚIE: Acest script rulează exclusiv din terminal, pe serverul fizic.");
    console.log("           Nu este expus pe web și necesită acces la mediul de producție.\n");

    const fullName = await ask("Nume Administrator: ");
    if (!fullName) throw new Error("Numele este obligatoriu!");

    const email = await ask("Email Login: ");
    if (!email || !email.includes('@')) throw new Error("Email invalid!");

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) throw new Error("Acest email există deja!");

    const password = await ask("Parolă: ");

    // Reguli stricte de complexitate a parolei:
    // Minim 12 caractere, cel puțin o literă mare, o literă mică, un număr și un caracter special.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

    if (!passwordRegex.test(password)) {
      throw new Error("\nParola nu este suficient de puternică!\nTrebuie să conțină:\n - Minim 12 caractere\n - Cel puțin o literă MARE (A-Z)\n - Cel puțin o literă mică (a-z)\n - Cel puțin o cifră (0-9)\n - Cel puțin un caracter special (@, $, !, %, *, ?, &)");
    }

    // Folosim cost logic de factor 12 (sau chiar 14 pe servere puternice), oferind protecție masivă
    // împotriva dicționarului și brute force offline.
    console.log("\nSe criptează parola...");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Creează User Admin
    await pool.query(
      `INSERT INTO users (full_name, email, password, role, is_verified, created_at)
       VALUES ($1, $2, $3, 'admin', true, NOW())`,
      [fullName, email, hashedPassword]
    );

    console.log(`\n✅ SUCCES: Contul de admin '${fullName}' (${email}) a fost creat securizat!`);
    console.log("Te poți autentifica imediat în platformă.");

  } catch (err) {
    console.error("\n❌ EROARE:", err.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();
