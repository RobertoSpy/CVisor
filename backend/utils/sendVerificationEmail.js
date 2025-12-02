const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Trimite email cu codul de verificare, folosit la crearea contului.
 * @param {string} to - Adresa de email destinatar.
 * @param {string} code - Codul de verificare generat.
 */
async function sendVerificationEmail(to, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Cod de verificare CVISOR",
    text: `Bun venit! Codul tău de verificare pentru CVISOR este: ${code}\n\nIntrodu acest cod pentru a valida adresa de email.`,
  });
}

/**
 * [NEW] Trimite email cu codul de resetare a parolei.
 */
async function sendResetEmail(to, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Resetare Parolă CVISOR",
    text: `Salut! Ai solicitat resetarea parolei.\n\nCodul tău de verificare este: ${code}\n\nDacă nu ai solicitat acest lucru, ignoră acest email.`,
  });
}

module.exports = { sendVerificationEmail, sendResetEmail };