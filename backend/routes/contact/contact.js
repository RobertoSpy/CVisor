const express = require("express");
const nodemailer = require("nodemailer");
const { validate, contactSchema } = require("../../middleware/validation");
const router = express.Router();

// 1. Mută configurarea transporterului în afara rutei pentru performanță
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Asigură-te că acesta este un "App Password"
  },
});

router.post("/", validate(contactSchema), async (req, res) => {
  const { name, email, message } = req.body;
  const telefon = req.body.telefon || req.body.phone || "";

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[Contact] Email credentials not configured");
    return res.status(500).json({ ok: false, error: "Email service not configured" });
  }

  try {
    await transporter.sendMail({
      from: `"CVISOR Contact" <${process.env.EMAIL_USER}>`, 
      replyTo: email, 
      to: process.env.EMAIL_USER,
      subject: `Mesaj contact CVISOR de la ${name}`,
      text: `Nume: ${name}\nEmail: ${email}\nTelefon: ${telefon}\nMesaj: ${message}`,
    });
    
    res.json({ ok: true, message: "Mesaj trimis cu succes" });
  } catch (err) {
    console.error("[Contact] Failed to send email:", err.message);
    res.status(500).json({ ok: false, error: "Eroare la trimiterea mesajului" });
  }
}); // <--- Aici era eroarea (era o acoladă în plus înainte)

module.exports = router;