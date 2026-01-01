const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const botRoutes = require('./routes/bot.routes');
const mlRoutes = require('./routes/ml.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());

// Serve Farmer Voice Bot frontend under /callbot
// This exposes the nested project frontend so users can open it from the main dashboard
app.use('/callbot', express.static(path.join(__dirname, '..', 'bot', 'farmer-voice-bot', 'farmer-voice-bot', 'frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/ml', mlRoutes);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server after verifying DB
async function startServer() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('⚠️ Database is not available — starting server without DB connection for local dev.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 GrassRoots Backend running on http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    if (!dbOk) {
      console.log('⚠️ Note: Database connection failed. Some features may not work.');
    }
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
