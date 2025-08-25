const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", // pentru dezvoltare
    "https://cvisor.com",    // pentru producție
    "https://api.cvisor.com" // pentru producție
  ],
  credentials: true
}));
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});