const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
require('dotenv').config();
const path = require("path");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default || require('rate-limit-redis');
const IORedis = require('ioredis');

// Redis Client pentru Rate Limiting
const redisClient = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx)
const PORT = process.env.PORT || 5000;

// Security: Helmet.js - Adaugă header-uri de securitate
app.use(helmet({
  contentSecurityPolicy: false, // Dezactivat temporar pentru compatibilitate Next.js
  crossOriginEmbedderPolicy: false
}));

// Rate limiting global - Protecție DDoS și abuse
const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 300, // 300 requests / 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: "Prea multe cereri de la acest IP, te rugăm să încerci mai târziu.",
      error: "Too Many Requests"
    });
  }
});
app.use(limiter);

// Rate limiting strict pentru autentificare - Protecție brute force
const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // maxim 5 încercări de login
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Nu contorizează login-urile reușite
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: "Prea multe încercări de autentificare. Te rugăm să aștepți 15 minute.",
      error: "Too Many Requests"
    });
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Middleware CORS - configurabil via ALLOWED_ORIGINS (un singur bloc)
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:80",
  "http://localhost",
  "https://cvisor.com",
  "https://api.cvisor.com",
  "http://192.168.0.170:3000"
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : defaultOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS: Origin not allowed"), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

const useSecureCookies = process.env.COOKIE_SECURE === 'true';
if (process.env.NODE_ENV !== 'production') {
  console.log(`[App] NODE_ENV=${process.env.NODE_ENV}, COOKIE_SECURE=${useSecureCookies}`);
}

// ─── Routes ────────────────────────────────────────────────────────────────

const authRoutes = require("./routes/auth");
app.use("/api/auth", authLimiter, authRoutes);

const usersRoutes = require("./routes/students/users");
app.use("/api/users", usersRoutes);

const oppRoutes = require("./routes/students/opportunities");
app.use("/api/opportunities", oppRoutes);

const appsRoutes = require("./routes/students/applications");
app.use("/api/applications", appsRoutes);

const uploadRouter = require("./routes/upload");
app.use("/api/upload", uploadRouter);

// Organization routes
const orgBadges = require("./routes/organizations/badges");
app.use("/api/organizations", orgBadges);

const orgPoints = require("./routes/organizations/points");
app.use("/api/organizations", orgPoints);

const orgStats = require("./routes/organizations/stats");
app.use("/api/organizations/stats", orgStats);

const orgUsersRoutes = require("./routes/organizations/users");
app.use("/api/organizations/users", orgUsersRoutes);

const orgOppRoutes = require("./routes/organizations/opportunities");
app.use("/api/organizations/opportunities", orgOppRoutes);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/archive", express.static(path.join(__dirname, "archive")));

// Analytics & misc routes
const studentAnalytics = require("./routes/students/stats");
app.use("/api/students/stats", studentAnalytics);
app.use("/api/analytics/student", studentAnalytics);

const orgAnalytics = require("./routes/organizations/analytics");
app.use("/api/analytics/orgs", orgAnalytics);

// Admin routes
const adminStats = require('./routes/admin/stats');
app.use('/api/admin/stats', adminStats);

const adminUsers = require('./routes/admin/users');
app.use('/api/admin/users', adminUsers);

const contactRoutes = require("./routes/contact/contact");
app.use("/api/contact", contactRoutes);

const pointsRoutes = require('./routes/students/points');
app.use('/api/students', pointsRoutes);

const unsubRoutes = require('./routes/newsletter/unsubscribe');
app.use('/api/newsletter', unsubRoutes);

const badgesRoutes = require('./routes/students/badges');
app.use('/api/students', badgesRoutes);

const notificationsRoutes = require('./routes/notifications/push');
const verifyTokenOptional = require('./middleware/verifyTokenOptional');
app.use('/api/notifications', verifyTokenOptional, notificationsRoutes);

// ─── Error Handler (must be AFTER all routes) ──────────────────────────────

const errorHandler = require("./middleware/errorHandler");

app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err);
  if (res.headersSent) return next(err);

  const response = { error: "Internal Server Error" };

  // Detalii doar în development
  if (process.env.NODE_ENV !== 'production') {
    response.details = err?.message || "unknown";
    response.stack = err?.stack || null;
  }

  res.status(500).json(response);
});

app.use(errorHandler);

// ─── Jobs Scheduler & Workers ──────────────────────────────────────────────

const { startScheduler } = require('./jobs/newsletter');
const { startArchiver } = require('./jobs/archiver');
const { startWorkers } = require('./workers');

startScheduler();
startArchiver();
startWorkers();

// ─── Server Start ───────────────────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

module.exports = app;