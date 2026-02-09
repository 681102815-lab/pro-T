require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(cors()); // Allow all for local testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static(require('path').join(__dirname, '../')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  db.get('SELECT 1', [], (err) => {
    res.json({
      status: 'OK',
      database: err ? 'ERROR' : 'CONNECTED',
      dbError: err ? err.message : null,
      message: 'Server is running'
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Access the app at: http://localhost:${PORT}/Test%20(1).html`);
});

// Handle port already in use - try next port
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = PORT + 1;
    console.log(`Port ${PORT} in use, trying ${newPort}...`);
    const newServer = app.listen(newPort, () => {
      console.log(`🚀 Server running on port ${newPort}`);
      console.log(`🔗 Access the app at: http://localhost:${newPort}/Test%20(1).html`);
      // Save the port for frontend to read
      console.log(`PORT_ACTUAL=${newPort}`);
    });
    newServer.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`❌ Ports ${PORT} and ${newPort} both in use. Please close other Node processes.`);
        process.exit(1);
      }
    });
  } else {
    throw err;
  }
});
