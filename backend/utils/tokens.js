const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    // Short lived: 15 minutes
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = () => {
  // 64 bytes hex string
  return crypto.randomBytes(64).toString("hex");
};

module.exports = { generateAccessToken, generateRefreshToken };
