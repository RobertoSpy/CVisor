const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
require('dotenv').config();
const path = require("path"); 

const app = express();
const PORT = process.env.PORT;

// Middleware
/*app.use(cors({
  origin: [
    "http://localhost:3000", // pentru dezvoltare
    "https://cvisor.com",    // pentru producție
    "https://api.cvisor.com" // pentru producție
  ],
  credentials: true
}));
*/

app.use(express.json());

// PostgreSQL connection pool este importat din db.js

// Basic test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

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
app.use("/api/auth", authRoutes);


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
  res.status(500).json({
    error: "Internal Server Error",
    details: err?.message || "unknown",
    stack: err?.stack || null,
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});