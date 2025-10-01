const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByEmail, saveUser, setUserVerified, setUserVerificationCode } = require("../db");
const { pool } = require("../db");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail"); // trebuie implementat nodemailer

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role)
    return res.status(400).json({ message: "Toate câmpurile sunt necesare" });

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser)
      return res.status(409).json({ message: "Email deja folosit" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const code = crypto.randomInt(100000, 999999).toString(); // Cod 6 cifre

    await saveUser({ 
      full_name: fullName,
      email, 
      password: hashedPassword, 
      role,
      is_verified: false,
      email_verification_code: code
    });

    // trimite codul pe email (implementează sendVerificationEmail)
    await sendVerificationEmail(email, code);

    res.json({ message: "Înregistrare reușită, verifică emailul." });
  } catch (err) {
    res.status(500).json({ message: "Eroare internă", error: err.message });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ message: "Email și cod necesare" });

  try {
    const user = await getUserByEmail(email);
    console.log("User găsit:", user);
    console.log("Cod primit:", code, "Cod din DB:", user?.email_verification_code);

    if (!user) return res.status(404).json({ message: "User inexistent" });
    if (user.is_verified) return res.status(400).json({ message: "Email deja verificat" });
    if (user.email_verification_code !== code)
      return res.status(400).json({ message: "Cod greșit" });

    await setUserVerified(email);
    res.json({ message: "Email validat cu succes" });
  } catch (err) {
    console.error("EROARE la /verify-email:", err);
    res.status(500).json({ message: "Eroare internă", error: err.message });
  }
});

// Login: permite doar useri verificați!
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email și parolă necesare" });

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Utilizator inexistent" });

    if (!user.is_verified) 
      return res.status(403).json({ message: "Emailul nu este validat!" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Parolă greșită" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login reușit", token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ message: "Eroare internă", error: err.message });
  }
});

module.exports = router;