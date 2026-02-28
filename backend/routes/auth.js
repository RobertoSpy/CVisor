const express = require("express");
const router = express.Router();
const authService = require("../services/AuthService");
const verifyToken = require("../middleware/verifyToken");
const { validate, registerSchema, loginSchema, emailVerificationSchema, forgotPasswordSchema, passwordResetSchema } = require("../middleware/validation");

const useSecureCookies = process.env.COOKIE_SECURE === 'true';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set in environment variables.");
}

router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (err) {
    if (err.message === "Email deja folosit") {
      return res.status(409).json({ message: err.message });
    }
    console.error("[register] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

router.post("/verify-email", validate(emailVerificationSchema), async (req, res) => {
  try {
    const result = await authService.verifyEmail(req.body.email, req.body.code);
    res.json(result);
  } catch (err) {
    if (err.message.includes("Cod")) {
      return res.status(400).json({ message: err.message });
    }
    console.error("[verify-email] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    console.error("[forgot-password] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

router.post("/reset-password", validate(passwordResetSchema), async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
    res.json(result);
  } catch (err) {
    if (err.message.includes("Cod")) {
      return res.status(400).json({ message: err.message });
    }
    console.error("[reset-password] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { token, refreshToken, refreshDuration, user, message } = await authService.login(
      req.body.email,
      req.body.password,
      req.headers["user-agent"],
      req.ip,
      req.body.rememberMe
    );

    // Set Cookies
    console.log(`[Login] Setting cookies with SECURE=${useSecureCookies}`);
    res.cookie("token", token, {
      httpOnly: true,
      secure: useSecureCookies, // Configurable via COOKIE_SECURE
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/", // Critical: accessible across the entire app
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: "lax",
      maxAge: refreshDuration,
      path: "/",
    });

    res.json({ message: "Login reușit", token, user });

  } catch (err) {
    if (err.message === "Utilizator inexistent" || err.message === "Parolă greșită") {
      return res.status(401).json({ message: err.message });
    }
    if (err.message === "Emailul nu este validat!") {
      return res.status(403).json({ message: err.message });
    }
    console.error("[login] Error:", err.message);
    res.status(500).json({ message: "Eroare internă" });
  }
});

router.post("/logout", async (req, res) => {
  await authService.logout(req.cookies.refresh_token);
  res.clearCookie("token");
  res.clearCookie("refresh_token");
  res.json({ message: "Logout reușit" });
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await authService.getMe(req.user.email);
    res.json(user);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    console.error("ERROR /me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;