const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const styles = {
  container: "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;",
  header: "background-color: #dc2626; padding: 30px; text-align: center;", // Red header for warning
  headerTitle: "color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;",
  content: "padding: 30px; background-color: #ffffff;",
  title: "color: #b91c1c; font-size: 22px; margin-top: 0;",
  text: "color: #374151; font-size: 16px; line-height: 1.6;",
  warningBox: "background-color: #fef2f2; border: 1px solid #f87171; border-radius: 6px; padding: 20px; margin: 25px 0;",
  warningText: "font-size: 16px; color: #991b1b; font-weight: 500; white-space: pre-wrap;",
  footer: "background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;",
  footerText: "color: #6b7280; font-size: 12px; margin: 5px 0;",
  link: "color: #dc2626; text-decoration: none;"
};

const footerHtml = `
  <div style="${styles.footer}">
    <p style="${styles.footerText}">© ${new Date().getFullYear()} CVISOR - Echipa Administrativă</p>
    <p style="${styles.footerText}">Iași, România</p>
    <p style="${styles.footerText}">
      Pentru contestații sau clarificări, răspunde la acest email.
    </p>
  </div>
`;

/**
 * Trimite un email de avertisment din partea administratorului.
 */
async function sendWarningEmail(to, userName, reason) {
  const html = `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">CVISOR Avertisment Oficial</h1>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.title}">Atenție, ${userName || "Utilizator CVISOR"},</h2>
        <p style="${styles.text}">Acesta este un mesaj oficial din partea echipei de administrare CVISOR referitor la contul tău.</p>
        <p style="${styles.text}">Am constatat o neregulă care necesită atenția ta imediată:</p>
        
        <div style="${styles.warningBox}">
          <p style="${styles.warningText}">${reason}</p>
        </div>
        
        <p style="${styles.text}">Te rugăm să remediezi această problemă pentru a evita suspendarea contului sau restricționarea accesului pe platformă.</p>
        <p style="${styles.text}">Cu seriozitate,<br>Echipa Administrativă CVISOR</p>
      </div>
      ${footerHtml}
    </div>
  `;

  await transporter.sendMail({
    from: `"Echipa Administrativă CVISOR" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Avertisment Oficial - Platforma CVISOR",
    html,
    text: `Atenție! Acesta este un avertisment oficial referitor la contul tău CVISOR. Motiv: ${reason}`,
  });
}

module.exports = { sendWarningEmail };
