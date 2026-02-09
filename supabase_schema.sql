-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  role TEXT DEFAULT 'user',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  "reportId" BIGINT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  detail TEXT NOT NULL,
  owner TEXT NOT NULL REFERENCES users(username),
  status TEXT DEFAULT 'รอรับเรื่อง',
  feedback TEXT,
  "likesCount" INTEGER DEFAULT 0,
  "dislikesCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  "reportId" INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  author TEXT NOT NULL REFERENCES users(username),
  text TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Likes table
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  "reportId" INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES users(username),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("reportId", username)
);

-- Create Dislikes table
CREATE TABLE IF NOT EXISTS dislikes (
  id SERIAL PRIMARY KEY,
  "reportId" INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES users(username),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("reportId", username)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_reports_owner ON reports(owner);
CREATE INDEX IF NOT EXISTS idx_comments_report ON comments("reportId");

-- Seed default users (Optional, but useful for testing)
-- INSERT INTO users (username, email, password, "firstName", role) 
-- VALUES ('admin', 'admin@example.com', '$2a$10$YourHashedPassword', 'Admin', 'admin')
-- ON CONFLICT (username) DO NOTHING;
