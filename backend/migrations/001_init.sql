-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'organization', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  email_verification_code VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
-- STUDENT PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  headline VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  skills TEXT [],
  -- stored as array or JSON in code, using text[] for PG
  social JSONB DEFAULT '{}',
  location VARCHAR(255),
  opportunity_refs JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);
-- ORGANIZATION PROFILES
CREATE TABLE IF NOT EXISTS organization_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  headline VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location VARCHAR(255),
  volunteers INTEGER DEFAULT 0,
  social JSONB DEFAULT '{}',
  events JSONB DEFAULT '[]',
  key_people JSONB DEFAULT '[]',
  contact_persons JSONB DEFAULT '[]',
  media JSONB DEFAULT '[]',
  history TEXT,
  video_url TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
-- OPPORTUNITIES
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  -- 'party' or 'self-development'
  skills TEXT [],
  deadline DATE,
  available_spots INTEGER,
  price NUMERIC(10, 2),
  banner_image TEXT,
  promo_video TEXT,
  gallery TEXT [],
  participants JSONB DEFAULT '[]',
  location VARCHAR(255),
  tags TEXT [],
  agenda JSONB,
  faq JSONB,
  reviews JSONB,
  description TEXT,
  cta_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
-- EDUCATION (Student)
CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school VARCHAR(255),
  degree VARCHAR(255),
  start_ym VARCHAR(50),
  end_ym VARCHAR(50),
  details TEXT
);
-- EXPERIENCE (Student)
CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(255),
  company VARCHAR(255),
  start_ym VARCHAR(50),
  end_ym VARCHAR(50),
  details TEXT
);
-- PORTFOLIO MEDIA (Student)
CREATE TABLE IF NOT EXISTS portfolio_media (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(50),
  -- 'image' or 'video'
  url TEXT,
  caption TEXT
);
-- GAMIFICATION / POINTS
CREATE TABLE IF NOT EXISTS user_points (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_point_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_delta INTEGER NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50),
  awarded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
-- STREAKS
CREATE TABLE IF NOT EXISTS user_streak_repairs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repaired_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, repaired_date)
);
-- APP EVENTS (Analytics/Logs)
CREATE TABLE IF NOT EXISTS app_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE
  SET NULL,
    event_type VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
-- VOLUNTEERS (Referenced in org stats)
CREATE TABLE IF NOT EXISTS volunteers (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW()
);
-- PROJECTS (Referenced in org stats)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
-- FUNCTIONS & TRIGGERS
-- Function to add initial points on user creation
CREATE OR REPLACE FUNCTION add_initial_points() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO user_points (user_id, points)
VALUES (NEW.id, 0);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger for initial points
DROP TRIGGER IF EXISTS trg_add_initial_points ON users;
CREATE TRIGGER trg_add_initial_points
AFTER
INSERT ON users FOR EACH ROW EXECUTE FUNCTION add_initial_points();