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
  header: "background-color: #1e3a8a; padding: 30px; text-align: center;",
  headerTitle: "color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;",
  content: "padding: 30px; background-color: #ffffff;",
  title: "color: #1e3a8a; font-size: 22px; margin-top: 0;",
  text: "color: #374151; font-size: 16px; line-height: 1.6;",
  codeBox: "background-color: #eff6ff; border: 1px dashed #bfdbfe; border-radius: 6px; padding: 20px; text-align: center; margin: 25px 0;",
  code: "font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; font-family: monospace;",
  buttonBox: "text-align: center; margin: 30px 0;",
  button: "background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;",
  footer: "background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;",
  footerText: "color: #6b7280; font-size: 12px; margin: 5px 0;",
  link: "color: #2563eb; text-decoration: none;"
};

const footerHtml = `
  <div style="${styles.footer}">
    <p style="${styles.footerText}">© ${new Date().getFullYear()} CVISOR - Platforma ta de evenimente</p>
    <p style="${styles.footerText}">Iași, România</p>
    <p style="${styles.footerText}">
      Ai întrebări? Contactează-ne la <a href="mailto:cvisor.contact@gmail.com" style="${styles.link}">cvisor.contact@gmail.com</a>
    </p>
  </div>
`;

/**
 * Trimite email cu codul de verificare (Design Profesional)
 */
async function sendVerificationEmail(to, code) {
  const html = `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">CVISOR</h1>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.title}">Bun venit în comunitate! 👋</h2>
        <p style="${styles.text}">Salut,</p>
        <p style="${styles.text}">Îți mulțumim că te-ai alăturat CVISOR. Pentru a-ți activa contul și a începe să explorezi oportunitățile, te rugăm să folosești codul de mai jos:</p>
        
        <div style="${styles.codeBox}">
          <span style="${styles.code}">${code}</span>
        </div>
        
        <p style="${styles.text}">Acest cod este valabil timp de 15 minute. Dacă nu ai solicitat crearea acestui cont, poți ignora acest email.</p>
        <p style="${styles.text}">Cu drag,<br>Roberto</p>
      </div>
      ${footerHtml}
    </div>
  `;

  await transporter.sendMail({
    from: `"Roberto de la CVISOR" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Codul tău de activare CVISOR",
    html,
    text: `Codul tău de verificare este: ${code}`,
  });
}

/**
 * Trimite email cu codul de resetare a parolei.
 */
async function sendResetEmail(to, code) {
  const html = `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">Resetează Parola</h1>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.title}">Ai solicitat resetarea parolei? 🔒</h2>
        <p style="${styles.text}">Am primit o cerere de resetare a parolei pentru contul tău CVISOR.</p>
        <p style="${styles.text}">Folosește codul de mai jos pentru a seta o nouă parolă:</p>
        
        <div style="${styles.codeBox}">
          <span style="${styles.code}">${code}</span>
        </div>
        
        <p style="${styles.text}">Dacă nu ai făcut această cerere, contul tău este în siguranță și nu trebuie să faci nimic.</p>
      </div>
      ${footerHtml}
    </div>
  `;

  await transporter.sendMail({
    from: `"Securitate CVISOR" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Resetare parolă CVISOR",
    html,
    text: `Codul tău de resetare este: ${code}`,
  });
}

/**
 * [NEW] Trimite email de bun venit după înregistrare reușită.
 */
async function sendWelcomeEmail(to) {
  const html = `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">Bine ai venit la CVISOR! 🚀</h1>
      </div>
      <div style="${styles.content}">
        <h2 style="${styles.title}">Contul tău a fost creat cu succes!</h2>
        <p style="${styles.text}">Ne bucurăm să te avem alături. Iată ce poți face acum pe platformă:</p>
        
        <ul style="color: #374151; font-size: 16px; line-height: 1.6; padding-left: 20px;">
          <li style="margin-bottom: 10px;">🎓 <strong>Explorează Oportunități:</strong> Găsește evenimente, workshop-uri și voluntariate.</li>
          <li style="margin-bottom: 10px;">🏆 <strong>Câștigă Badge-uri:</strong> Strânge puncte și deblochează realizări.</li>
          <li style="margin-bottom: 10px;">🤝 <strong>Conectează-te:</strong> Interacționează cu organizații de top.</li>
        </ul>

        <div style="${styles.buttonBox}">
          <a href="https://cvisor.ro/login" style="${styles.button}">Intră în Cont</a>
        </div>
        
        <p style="${styles.text}">Dacă ai întrebări sau sugestii, suntem aici pentru tine. Răspunde la acest email și un membru al echipei te va ajuta.</p>
        <p style="${styles.text}">Spor la explorat!<br>Roberto</p>
      </div>
      ${footerHtml}
    </div>
  `;

  await transporter.sendMail({
    from: `"Roberto de la CVISOR" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Bun venit în comunitatea CVISOR! Start la oportunități 🌟",
    html,
    text: `Bine ai venit! Contul tău a fost creat. Explorează acum oportunitățile pe CVISOR.`,
  });
}

module.exports = { sendVerificationEmail, sendResetEmail, sendWelcomeEmail };