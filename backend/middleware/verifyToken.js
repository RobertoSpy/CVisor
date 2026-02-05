const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const crypto = require("crypto");
const { generateAccessToken } = require("../utils/tokens");

module.exports = async function verifyToken(req, res, next) {
  let token = req.cookies.token;

  // FALLBACK: Verifică headerul Authorization (pentru Mobile/Flutter)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // If no access token, but we have a refresh token, try to refresh!
    if (req.cookies.refresh_token) {
      return await tryRefresh(req, res, next);
    }
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" && req.cookies.refresh_token) {
      return await tryRefresh(req, res, next);
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

async function tryRefresh(req, res, next) {
  const rawRefreshToken = req.cookies.refresh_token;
  if (!rawRefreshToken) return res.status(401).json({ message: "Session expired" });

  try {
    const hash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

    // Find valid refresh token
    const result = await pool.query(
      `SELECT rt.*, u.id as u_id, u.email, u.role, u.full_name 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.is_revoked = FALSE AND rt.expires_at > NOW()`,
      [hash]
    );

    if (result.rows.length === 0) {
      // Invalid/Revoked/Expired refresh token
      res.clearCookie("token");
      res.clearCookie("refresh_token");
      return res.status(401).json({ message: "Session invalid" });
    }

    const user = {
      id: result.rows[0].u_id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      full_name: result.rows[0].full_name
    };

    // Generate new Access Token
    const newToken = generateAccessToken(user);

    // Set new cookie
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: false, // Ensure false for HTTP testing
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 min match
    });

    req.user = user;
    next();
  } catch (dbErr) {
    console.error("Refresh Token DB Error:", dbErr);
    return res.status(500).json({ message: "Internal Auth Error" });
  }
}
