const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  const { nume, email, telefon, mesaj } = req.body;

  // Verifică variabilele de mediu
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Mesaj contact CVISOR de la ${nume}`,
      text: `Nume: ${nume}\nEmail: ${email}\nTelefon: ${telefon}\nMesaj: ${mesaj}`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Eroare la trimiterea emailului:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;