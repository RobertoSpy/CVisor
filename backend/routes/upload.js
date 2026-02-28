const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { validateFile, fileUploadSchema } = require("../middleware/validation");

const router = express.Router();

// SECURITATE: Tipuri de fișiere permise (doar imagini)
// SECURITATE: Tipuri de fișiere permise (imagini + video)
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
];

// SECURITATE: Extensii permise (whitelist)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.ogg', '.mov'];

// SECURITATE: Limită de 30MB (optimizat pentru 10k+ useri)
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

// VIDEO: Durată maximă 20 secunde
const MAX_VIDEO_DURATION = 20; // secunde

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
      new Error(`Tip fișier nepermis: ${file.mimetype}. Sunt permise imagini și video (MP4, WebM).`),
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
router.post("/", upload.single("file"), validateFile(fileUploadSchema), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file",
        message: "Niciun fișier nu a fost uploadat"
      });
    }

    const fs = require('fs');
    const sharp = require('sharp');

    // ── VIDEO DURATION CHECK (max 20 seconds) ────────────────────
    if (req.file.mimetype.startsWith('video/')) {
      try {
        const ffmpeg = require('fluent-ffmpeg');
        const duration = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(req.file.path, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 0);
          });
        });

        if (duration > MAX_VIDEO_DURATION) {
          // Delete the uploaded file
          try { fs.unlinkSync(req.file.path); } catch (_) { }
          return res.status(400).json({
            error: "Video too long",
            message: `Videoul este prea lung (${Math.round(duration)}s). Maxim ${MAX_VIDEO_DURATION} secunde permise.`
          });
        }
      } catch (probeErr) {
        console.warn("[Upload] ffprobe check failed, allowing upload:", probeErr.message);
        // If ffprobe fails (e.g. not installed), allow upload but log warning
      }
    }

    // Procesare Imagini (Compresie)
    if (req.file.mimetype.startsWith('image/')) {
      const optimizedFilename = `opt-${req.file.filename}`;
      const optimizedPath = path.join(req.file.destination, optimizedFilename);

      try {
        // Use sharp with limit concurrency to avoid memory spikes
        sharp.concurrency(1);
        await sharp(req.file.path)
          .rotate() // Auto-rotate based on EXIF
          .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true }) // Max HD
          .jpeg({ quality: 80, force: false })
          .png({ quality: 80, force: false })
          .webp({ quality: 80, force: false })
          .toFile(optimizedPath);

        // Şterge originalul necomprimat
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (unlinkErr) {
          console.error("[Upload] Failed to unlink original:", unlinkErr);
        }

        // Actualizează referințele către fișierul nou
        req.file.filename = optimizedFilename;
        req.file.size = fs.statSync(optimizedPath).size;

        console.log(`[Upload] Image compressed: ${req.file.filename} (${req.file.size} bytes)`);
      } catch (sharpError) {
        console.warn("[Upload] Compression failed, using original:", sharpError);
        // Fallback: rămâne fișierul original
      }
    } else {
      console.log(`[Upload] File uploaded (no compression for non-image): ${req.file.filename}, size: ${req.file.size} bytes`);
    }

    // Modificat pentru a salva calea relativă
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error("[Upload] Critical Error:", error);
    // Ensure we don't crash the server, though Express usually catches this. 
    // Socket hang up implies the event loop blocked or process died.
    if (!res.headersSent) {
      res.status(500).json({
        error: "Upload failed",
        message: error.message
      });
    }
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