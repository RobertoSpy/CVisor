const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  let token = req.cookies.token;

  // FALLBACK: Verifică headerul Authorization (pentru Mobile/Flutter)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // acum ai req.user = { id, email, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
