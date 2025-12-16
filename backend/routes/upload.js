const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { validateFile, fileUploadSchema } = require("../middleware/validation");

const router = express.Router();

// SECURITATE: Tipuri de fișiere permise (doar imagini)
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// SECURITATE: Extensii permise (whitelist)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// SECURITATE: Limită de 20MB (echilibru între calitate și protecție)
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Configurare storage securizat
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // SECURITATE: Generează nume unic random (evită collision și predictibilitate)
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();

    // Verifică extensia
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Extensie fișier nepermi să: ${ext}`));
    }

    cb(null, `${Date.now()}-${randomName}${ext}`);
  },
});

// Filtru pentru tipuri de fișiere (validare pre-upload)
const fileFilter = (req, file, cb) => {
  // Verifică MIME type
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(
      new Error(`Tip fișier nepermis: ${file.mimetype}. Doar imagini (JPEG, PNG, WebP, GIF) sunt permise.`),
      false
    );
  }

  // Verifică extensia din originalname
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`Extensie nepermisă: ${ext}`),
      false
    );
  }

  cb(null, true);
};

// Configurare multer SECURIZAT
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Doar un fișier per request
  },
  fileFilter: fileFilter
});

/**
 * POST /api/upload
 * Upload fișier securizat cu validări multiple
 */
router.post("/", upload.single("file"), validateFile(fileUploadSchema), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file",
        message: "Niciun fișier nu a fost uploadat"
      });
    }

    // Log pentru audit
    console.log(`[Upload] File uploaded: ${req.file.filename}, size: ${req.file.size} bytes, mimetype: ${req.file.mimetype}`);

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    res.status(500).json({
      error: "Upload failed",
      message: error.message
    });
  }
});

// Error handler pentru multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: "File too large",
        message: `Fișierul este prea mare. Maxim ${MAX_FILE_SIZE / (1024 * 1024)}MB permis.`
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: "Unexpected file",
        message: "Fișier neașteptat. Trimite doar un fișier."
      });
    }
  }

  if (error.message) {
    return res.status(400).json({
      error: "Upload error",
      message: error.message
    });
  }

  next(error);
});

module.exports = router;