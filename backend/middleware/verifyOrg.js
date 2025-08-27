module.exports = function verifyOrg(req, res, next) {
  // Dacă folosești JWT și salvezi rolul în req.user
  if (req.user && req.user.role === "organization") {
    return next();
  }
  return res.status(403).json({ message: "Acces permis doar organizațiilor." });
};