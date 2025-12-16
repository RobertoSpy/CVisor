const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
require('dotenv').config();
const path = require("path");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Helmet.js - Adaugă header-uri de securitate
app.use(helmet({
  contentSecurityPolicy: false, // Dezactivat temporar pentru compatibilitate Next.js
  crossOriginEmbedderPolicy: false
}));

// Rate limiting global - Protecție DDoS și abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 requests în producție, 1000 în dev
  message: 'Prea multe cereri de la acest IP, te rugăm să încerci mai târziu.'
});
app.use(limiter);

// Rate limiting strict pentru autentificare - Protecție brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // maxim 5 încercări de login
  message: 'Prea multe încercări de autentificare. Te rugăm să aștepți 15 minute.',
  skipSuccessfulRequests: true // Nu contorizează login-urile reușite
});

app.use(express.json());
app.use(cookieParser());

// Middleware CORS - configurabil via ALLOWED_ORIGINS
const defaultOrigins = [
  "http://localhost:3000",
  "https://cvisor.com",
  "https://api.cvisor.com"
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : defaultOrigins;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// API: Hello (reads current time from Postgres)
app.get('/hello', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({
      message: 'Hello from backend!',
      time: result.rows[0].time,
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authLimiter, authRoutes); // Aplică rate limiting pe auth routes


const usersRoutes = require("./routes/students/users");
app.use("/api/users", usersRoutes);

const oppRoutes = require("./routes/students/opportunities");
app.use("/api/opportunities", oppRoutes);


const appsRoutes = require("./routes/students/applications");
app.use("/api/applications", appsRoutes);

const uploadRouter = require("./routes/upload");
app.use("/api/upload", uploadRouter);

const allStudentsRoutes = require("./routes/students/users");
app.use("/api/users", allStudentsRoutes);


//org
const orgBadges = require("./routes/organizations/badges");
app.use("/api/organizations", orgBadges);

const orgPoints = require("./routes/organizations/points");
app.use("/api/organizations", orgPoints);

const orgStats = require("./routes/organizations/stats");
app.use("/api/organizations/stats", orgStats);




// --- NEW: Rute pentru ORGANIZAȚII
const orgUsersRoutes = require("./routes/organizations/users");
app.use("/api/organizations/users", orgUsersRoutes);

const orgOppRoutes = require("./routes/organizations/opportunities");
app.use("/api/organizations/opportunities", orgOppRoutes);

/*
const orgTimelineRoutes = require("./routes/organizations/timeline");
app.use("/api/organizations/timeline", orgTimelineRoutes);

const orgTestimonialsRoutes = require("./routes/organizations/testimonials");
app.use("/api/organizations/testimonials", orgTestimonialsRoutes);

const orgSkillsRoutes = require("./routes/organizations/skills");
app.use("/api/organizations/skills", orgSkillsRoutes);
*/

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Noua structură
const studentAnalytics = require("./routes/students/stats");
app.use("/api/students/stats", studentAnalytics);



app.use("/api/analytics/student", studentAnalytics);

const orgAnalytics = require("./routes/organizations/analytics");
app.use("/api/analytics/orgs", orgAnalytics); // ← Și asta pentru orgs


const contactRoutes = require("./routes/contact/contact");
app.use("/api/contact", contactRoutes);

const pointsRoutes = require('./routes/students/points');
app.use('/api/students', pointsRoutes);

const badgesRoutes = require('./routes/students/badges');
app.use('/api/students', badgesRoutes);

app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err);
  if (res.headersSent) return next(err);

  // SECURITATE: Nu expune stack trace în producție
  const response = {
    error: "Internal Server Error"
  };

  // Detalii doar în development
  if (process.env.NODE_ENV !== 'production') {
    response.details = err?.message || "unknown";
    response.stack = err?.stack || null;
  }

  res.status(500).json(response);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});