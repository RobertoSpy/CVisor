const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configurează storage local (folderul uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder local
  },
  filename: function (req, file, cb) {
    // Nume unic: timestamp + nume original fără spații
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage: storage });

// POST /api/upload - primește un fișier
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Niciun fișier uploadat" });
  }
  // Construiește url-ul public pentru imagine
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = router;