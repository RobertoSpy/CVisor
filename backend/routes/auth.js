const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Asigură-te că ai instalat bcrypt
const jwt = require("jsonwebtoken"); // Pentru token, dacă folosești JWT
const { getUserByEmail, saveUser } = require("../db"); // Exemplu funcție DB

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email și parolă necesare" });

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Utilizator inexistent" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Parolă greșită" });

    // Creezi token JWT pentru sesiune
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login reușit", token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Eroare internă", error: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ message: "Email, parolă și rol necesare" });

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser)
      return res.status(409).json({ message: "Email deja folosit" });

    const hashedPassword = await bcrypt.hash(password, 12);
    // Salvezi userul în DB (implementare exemplu)
    await saveUser({ email, password: hashedPassword, role });

    res.json({ message: "Înregistrare reușită" });
  } catch (err) {
    res.status(500).json({ message: "Eroare internă", error: err.message });
  }
});

module.exports = router;