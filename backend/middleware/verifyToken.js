const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Missing Bearer token" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // acum ai req.user = { id, email, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
