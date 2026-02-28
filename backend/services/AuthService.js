const BaseService = require("./BaseService");
const userRepository = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendVerificationEmail, sendResetEmail, sendWelcomeEmail } = require("../utils/sendVerificationEmail");
const { awardSignupPoints, awardBadgePoints } = require("../utils/pointsManager");
// pool is removed, use repository or inject client
const { generateAccessToken, generateRefreshToken } = require("../utils/tokens");

class AuthService extends BaseService {
  constructor() {
    super(userRepository);
  }

  async register(data) {
    const { fullName, email, password } = data;

    const existingUser = await this.repository.findByEmail(email);
    const hashedPassword = await bcrypt.hash(password, 12);
    const code = crypto.randomInt(100000, 999999).toString();

    let pointsAdded = 0;

    if (existingUser) {
      if (existingUser.is_verified) {
        throw new Error("Email deja folosit");
      }

      // User exists but is unverified - allow re-registration by overwriting data
      await this.repository.updateUnverifiedUser(email, fullName, hashedPassword, code);

      // Try resending the email
      try {
        await sendVerificationEmail(email, code);
      } catch (mailErr) {
        console.error("Failed to resend verification email:", mailErr);
      }

      return { message: "Codul a fost retrimis. Te rugăm să îți verifici emailul.", pointsAdded, reason: "re-registration" };
    }

    // Completely new user flow
    const newUser = await this.repository.create({
      full_name: fullName,
      email,
      password: hashedPassword,
      role: "student",
      is_verified: false,
      email_verification_code: code
    });

    try {
      await sendVerificationEmail(email, code);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    try {
      await awardSignupPoints(newUser.id);
      await this.repository.insertInitialBadge(newUser.id, 'lvl1');
      pointsAdded = 15;
    } catch (ptsErr) {
      console.error("Failed to add signup bonus:", ptsErr);
    }

    return { message: "Înregistrare reușită, verifică emailul.", pointsAdded, reason: "signup_bonus" };
  }

  async verifyEmail(email, code) {
    const user = await this.repository.findByEmail(email);

    // Security checks
    if (!user || user.is_verified || !user.email_verification_code) {
      throw new Error("Cod de verificare invalid sau expirat");
    }

    const isCodeValid = crypto.timingSafeEqual(
      Buffer.from(user.email_verification_code),
      Buffer.from(code)
    );

    if (!isCodeValid) {
      throw new Error("Cod de verificare invalid sau expirat");
    }

    await this.repository.setUserVerified(email);

    try {
      await sendWelcomeEmail(email);
    } catch (e) {
      console.error("Welcome email failed", e);
    }

    return { message: "Email validat cu succes" };
  }

  async forgotPassword(email) {
    const user = await this.repository.findByEmail(email);
    // Always return same message
    if (user) {
      const code = crypto.randomInt(100000, 999999).toString();
      await this.repository.setVerificationCode(email, code);
      try {
        await sendResetEmail(email, code);
      } catch (e) {
        console.error("Reset email failed", e);
      }
    }
    return { message: "Dacă emailul există, ai primit un cod pentru resetare." };
  }

  async resetPassword(email, code, newPassword) {
    const user = await this.repository.findByEmail(email);
    if (!user || !user.email_verification_code) {
      throw new Error("Cod de resetare invalid sau expirat");
    }

    const isCodeValid = crypto.timingSafeEqual(
      Buffer.from(user.email_verification_code),
      Buffer.from(code)
    );

    if (!isCodeValid) throw new Error("Cod de resetare invalid sau expirat");

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.repository.updatePassword(email, hashedPassword);

    return { message: "Parola a fost resetată cu succes!" };
  }

  async login(email, password, userAgent, ip, rememberMe) {
    const user = await this.repository.findByEmail(email);
    if (!user) throw new Error("Utilizator inexistent"); // Controller maps to 401
    if (!user.is_verified) throw new Error("Emailul nu este validat!"); // Controller maps to 403

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Parolă greșită"); // Controller maps to 401

    // Tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const refreshDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + refreshDuration);

    await this.repository.pool.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address) VALUES ($1, $2, $3, $4, $5)",
      [user.id, hash, expiresAt, userAgent, ip]
    );

    return {
      token,
      refreshToken,
      refreshDuration,
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      try {
        const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        await this.repository.pool.query("UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1", [hash]);
      } catch (e) {
        console.error("Logout revoke error:", e);
      }
    }
    return { message: "Logout reușit" };
  }

  async getMe(email) {
    const user = await this.repository.findByEmail(email);
    if (!user) throw new Error("User not found");
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };
  }
}

module.exports = new AuthService();
