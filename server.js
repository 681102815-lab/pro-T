require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
const userRoutes = require('./routes/user');

const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files from the public directory

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint for frontend check
app.get('/test', (req, res) => {
  res.json({ message: 'Hello from Vercel Backend!' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

// Start server ONLY if running directly (npm run dev / node server.js)
if (require.main === module) {
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Server running locally at http://localhost:${port}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('❌ Server error:', err);
      }
    });
  };
  startServer(process.env.PORT || 3001);
}

// Export app for serverless deployment
module.exports = app;
