const cron = require("node-cron");
const { pool } = require("../db");
const crypto = require("crypto");
const { newsletterQueue } = require("../lib/queue");

const styles = {
  container: "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;",
  header: "background-color: #1e3a8a; padding: 30px; text-align: center;",
  headerTitle: "color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;",
  content: "padding: 30px; background-color: #ffffff;",
  title: "color: #1e3a8a; font-size: 22px; margin-top: 0;",
  text: "color: #374151; font-size: 16px; line-height: 1.6;",
  statBox: "background-color: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #2563eb;",
  statItem: "margin: 5px 0; font-size: 15px; color: #1f2937;",
  footer: "background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;",
  footerText: "color: #6b7280; font-size: 12px; margin: 5px 0;",
  link: "color: #2563eb; text-decoration: none;"
};

const footerHtml = `
  <div style="${styles.footer}">
    <p style="${styles.footerText}">© ${new Date().getFullYear()} CVISOR - Platforma ta de evenimente</p>
    <p style="${styles.footerText}">Iași, România</p>
    <p style="${styles.footerText}">
      Ai feedback? Răspunde la acest email. <a href="mailto:cvisor.contact@gmail.com" style="${styles.link}">Contact</a>
    </p>
  </div>
`;

async function getStats() {
  const result = {};

  // Studenți noi (ultimele 14 zile)
  const usersRes = await pool.query(
    "SELECT COUNT(*) FROM users WHERE role='student' AND created_at > NOW() - INTERVAL '14 days'"
  );
  result.newStudents = usersRes.rows[0].count;

  // Oportunități Party
  const partyRes = await pool.query(
    "SELECT COUNT(*) FROM opportunities WHERE type='Party' AND created_at > NOW() - INTERVAL '14 days'"
  );
  result.newParty = partyRes.rows[0].count;

  // Oportunități Self Dev
  const devRes = await pool.query(
    "SELECT COUNT(*) FROM opportunities WHERE type='Self Development' AND created_at > NOW() - INTERVAL '14 days'"
  );
  result.newDev = devRes.rows[0].count;

  // Total evenimente
  const totalRes = await pool.query(
    "SELECT COUNT(*) FROM opportunities WHERE created_at > NOW() - INTERVAL '14 days'"
  );
  result.totalEvents = totalRes.rows[0].count;

  return result;
}

async function sendNewsletter() {
  console.log("[Newsletter] Starting bi-weekly dispatch...");
  try {
    const stats = await getStats();

    // 1. Fetch Organizations (Opt-in only)
    // NOTA: Presupunem că există coloana newsletter_opt_in. Dacă nu, query-ul va eșua pe DB-uri vechi.
    const orgs = await pool.query("SELECT id, email, organization_name FROM users WHERE role='organization' AND newsletter_opt_in = TRUE");

    const secret = process.env.JWT_SECRET || "default_secret";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    for (const org of orgs.rows) {
      // Generate Unsubscribe Link
      const token = crypto.createHmac("sha256", secret).update(org.email).digest("hex");
      const unsubLink = `${frontendUrl}/unsubscribe?email=${encodeURIComponent(org.email)}&token=${token}`;

      // Get org specific stats
      const myOppsRes = await pool.query(
        "SELECT COUNT(*) FROM opportunities WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '14 days'",
        [org.id]
      );
      const myOppsCount = myOppsRes.rows[0].count;

      const html = `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h1 style="${styles.headerTitle}">Raport CVISOR 📈</h1>
          </div>
          <div style="${styles.content}">
            <h2 style="${styles.title}">Salut, ${org.organization_name || "Partener CVISOR"}!</h2>
            <p style="${styles.text}">Vă mulțumim că sunteți cu noi. Iată ce s-a întâmplat pe platformă în ultimele două săptămâni:</p>
            
            <div style="${styles.statBox}">
              <div style="${styles.statItem}">👥 <strong>${stats.newStudents}</strong> studenți noi s-au înregistrat.</div>
              <div style="${styles.statItem}">🎉 <strong>${stats.newParty}</strong> oportunități de tip Party.</div>
              <div style="${styles.statItem}">📚 <strong>${stats.newDev}</strong> oportunități de Self Development.</div>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #bfdbfe;">
                🌟 <strong>${myOppsCount}</strong> dintre acestea sunt create de voi!
              </div>
            </div>

            <p style="${styles.text}">Vă mulțumim că ne ajutați să facem visul studenților realitate!</p>
            <p style="${styles.text}">Cu drag,<br>Roberto</p>
          </div>
          
          <div style="${styles.footer}">
            <p style="${styles.footerText}">© ${new Date().getFullYear()} CVISOR - Platforma ta de evenimente</p>
            <p style="${styles.footerText}">Iași, România</p>
            <p style="${styles.footerText}">
              Ai feedback? Răspunde la acest email. <a href="mailto:cvisor.contact@gmail.com" style="${styles.link}">Contact</a>
            </p>
            <p style="${styles.footerText}">
               Nu mai vrei aceste emailuri? <a href="${unsubLink}" style="${styles.link}">Dezabonează-te</a>
            </p>
          </div>
        </div>
      `;

      await newsletterQueue.add('send-newsletter-email', {
        to: org.email,
        subject: "Actualizări Bi-lunare CVISOR",
        html
      });
    }

    // 2. Fetch Students (Opt-in only)
    const students = await pool.query("SELECT email, first_name FROM users WHERE role='student' AND newsletter_opt_in = TRUE");

    for (const student of students.rows) {
      // Generate Unsubscribe Link
      const token = crypto.createHmac("sha256", secret).update(student.email).digest("hex");
      const unsubLink = `${frontendUrl}/unsubscribe?email=${encodeURIComponent(student.email)}&token=${token}`;

      const html = `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h1 style="${styles.headerTitle}">Noutăți CVISOR 🔥</h1>
          </div>
          <div style="${styles.content}">
            <h2 style="${styles.title}">Salut${student.first_name ? ", " + student.first_name : ""}!</h2>
            <p style="${styles.text}">Comunitatea crește! Iată ce s-a întâmplat în ultimele două săptămâni:</p>
            
            <div style="${styles.statBox}">
              <div style="${styles.statItem}">👥 <strong>${stats.newStudents}</strong> colegi noi ni s-au alăturat.</div>
              <div style="${styles.statItem}">🚀 <strong>${stats.totalEvents}</strong> evenimente noi postate.</div>
            </div>

            <p style="${styles.text}">Intră pe platformă să vezi ce oportunități te așteaptă!</p>
            <p style="${styles.text}">Dacă ai feedback pentru noi, te rugăm să ne scrii. Părerea ta contează.</p>
            <p style="${styles.text}">Pe curând,<br>Roberto</p>
          </div>
          
          <div style="${styles.footer}">
            <p style="${styles.footerText}">© ${new Date().getFullYear()} CVISOR - Platforma ta de evenimente</p>
            <p style="${styles.footerText}">Iași, România</p>
            <p style="${styles.footerText}">
               Nu mai vrei aceste emailuri? <a href="${unsubLink}" style="${styles.link}">Dezabonează-te</a>
            </p>
          </div>
        </div>
      `;

      await newsletterQueue.add('send-newsletter-email', {
        to: student.email,
        subject: "Noutăți CVISOR - Comunitatea Crește!",
        html
      });
    }

    console.log("[Newsletter] Dispatch complete.");
  } catch (err) {
    console.error("[Newsletter] Critical Error:", err);
  }
}

function startScheduler() {
  // Rulează pe 1 și 15 ale lunii la ora 10:00 AM
  cron.schedule("0 10 1,15 * *", () => {
    sendNewsletter();
  });
  console.log("[Scheduler] Newsletter job scheduled (1st & 15th of month).");
}

module.exports = { startScheduler, sendNewsletter };
