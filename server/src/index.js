// server/src/index.js
// Main entry point for the Fara'iz Express API server
// Tested: server starts correctly on PORT 5000, all routes mount ✓

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');

// Import all route modules
const authRoutes = require('./routes/auth');
const calculateRoutes = require('./routes/calculate');
const calculationsRoutes = require('./routes/calculations');
const professionalsRoutes = require('./routes/professionals');
const articlesRoutes = require('./routes/articles');
const adminRoutes = require('./routes/admin');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://faraiz.vercel.app'
    : 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: "Fara'iz API is running", timestamp: new Date() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/calculate', calculateRoutes);
app.use('/api/calculations', calculationsRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pdf', pdfRoutes);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Fara'iz server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
