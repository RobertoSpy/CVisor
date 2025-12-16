const express = require("express");
const nodemailer = require("nodemailer");
const { validate, contactSchema } = require("../middleware/validation");
const router = express.Router();

router.post("/", validate(contactSchema), async (req, res) => {
  const { name, email, message } = req.body;
  const telefon = req.body.telefon || req.body.phone || "";

  // SECURITATE: NU loga credențiale!
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[Contact] Email credentials not configured");
    return res.status(500).json({ ok: false, error: "Email service not configured" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // SECURITATE: Folosește email-ul nostru, nu al user-ului
      replyTo: email, // User-ul poate răspunde
      to: process.env.EMAIL_USER,
      subject: `Mesaj contact CVISOR de la ${name}`,
      text: `Nume: ${name}\nEmail: ${email}\nTelefon: ${telefon}\nMesaj: ${message}`,
    });
    res.json({ ok: true, message: "Mesaj trimis cu succes" });
  } catch (err) {
    console.error("[Contact] Failed to send email:", err.message); // NU loga err complet (poate conține credențiale)
    res.status(500).json({ ok: false, error: "Eroare la trimiterea mesajului" });
  }
});

module.exports = router;