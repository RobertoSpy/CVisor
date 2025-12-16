const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  getUserByEmail,
  saveUser,
  setUserVerified,
  setVerificationCode,
  updatePassword,
} = require("../db");
const { pool } = require("../db");
const crypto = require("crypto");
const { sendVerificationEmail, sendResetEmail } = require("../utils/sendVerificationEmail");
const verifyToken = require("../middleware/verifyToken");
const { validate, registerSchema, loginSchema } = require("../middleware/validation");
const { awardSignupPoints } = require("../utils/pointsManager");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set in environment variables.");
}

router.post("/register", validate(registerSchema), async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: "Email deja folosit" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const code = crypto.randomInt(100000, 999999).toString(); // Cod 6 cifre

    await saveUser({
      full_name: fullName,
      email,
      password: hashedPassword,
      role: "student", // Force student role for public registration
      is_verified: false,
      email_verification_code: code,
    });

    // trimite codul pe email (nu întrerupem fluxul dacă mailul eșuează)
    try {
      await sendVerificationEmail(email, code);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    // Bonus de bun venit: 10 puncte (via pointsManager)
    let pointsAdded = 0;
    try {
      const newUser = await getUserByEmail(email);
      if (newUser) {
        await awardSignupPoints(newUser.id);
        pointsAdded = 10;
      }
    } catch (ptsErr) {
      console.error("Failed to add signup bonus points:", ptsErr);
    }

    res.json({ message: "Înregistrare reușită, verifică emailul.", pointsAdded, reason: "signup_bonus" });
  } catch (err) {
    console.error("[register] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: "Email și cod necesare" });

  try {
    const user = await getUserByEmail(email);

    // SECURITATE: Verificări în ordinea corectă pentru a preveni user enumeration
    if (!user || user.is_verified || !user.email_verification_code) {
      // Răspuns generic pentru toate cazurile
      return res.status(400).json({ message: "Cod de verificare invalid sau expirat" });
    }

    // SECURITATE: Timing-safe comparison pentru cod
    const isCodeValid = crypto.timingSafeEqual(
      Buffer.from(user.email_verification_code),
      Buffer.from(code)
    );

    if (!isCodeValid) {
      return res.status(400).json({ message: "Cod de verificare invalid sau expirat" });
    }

    await setUserVerified(email);
    res.json({ message: "Email validat cu succes" });
  } catch (err) {
    console.error("[verify-email] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email necesar" });

  try {
    const user = await getUserByEmail(email);

    // SECURITATE: Trimite ACELAȘI răspuns indiferent dacă user-ul există
    // Previne user enumeration
    if (user) {
      const code = crypto.randomInt(100000, 999999).toString();
      await setVerificationCode(email, code);

      try {
        await sendResetEmail(email, code);
      } catch (mailErr) {
        console.error("[forgot-password] Failed to send reset email:", mailErr.message);
      }
    }

    // Răspuns IDENTIC indiferent dacă user-ul există sau nu
    res.json({ message: "Dacă emailul există, ai primit un cod pentru resetare." });
  } catch (err) {
    console.error("[forgot-password] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ message: "Toate câmpurile sunt necesare" });

  try {
    const user = await getUserByEmail(email);

    // SECURITATE: Verificări în ordinea corectă pentru a preveni user enumeration
    if (!user || !user.email_verification_code) {
      return res.status(400).json({ message: "Cod de resetare invalid sau expirat" });
    }

    // SECURITATE: Timing-safe comparison
    const isCodeValid = crypto.timingSafeEqual(
      Buffer.from(user.email_verification_code),
      Buffer.from(code)
    );

    if (!isCodeValid) {
      return res.status(400).json({ message: "Cod de resetare invalid sau expirat" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await updatePassword(email, hashedPassword);

    res.json({ message: "Parola a fost resetată cu succes!" });
  } catch (err) {
    console.error("[reset-password] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

// Login: permite doar useri verificați!
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Utilizator inexistent" });

    if (!user.is_verified) return res.status(403).json({ message: "Emailul nu este validat!" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Parolă greșită" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Setare cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false in dev
      sameSite: "lax", // 'strict' poate cauza probleme la redirect/PWA
      maxAge: 3600000 * 24, // 24 ore
    });

    res.json({
      message: "Login reușit",
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    });
  } catch (err) {
    console.error("[login] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout reușit" });
});

// Verificare sesiune (pentru frontend)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });
  } catch (err) {
    console.error("ERROR /me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;