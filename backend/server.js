require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMySQL } = require('./src/config/mysql');
const { ensureSeedData } = require('./src/services/seedDemoData');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// ── Routes
const authRoutes     = require('./src/routes/auth');
const doctorRoutes   = require('./src/routes/doctors');
const hospitalRoutes = require('./src/routes/hospitals');
const leadRoutes     = require('./src/routes/leads');
const promoteRoutes  = require('./src/routes/promote');
const appointmentRoutes = require('./src/routes/appointments');
const subscriptionRoutes = require('./src/routes/subscriptions');

const app = express();

// ── CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parser
app.use(express.json());

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ICC Backend is running 🚀', env: process.env.NODE_ENV });
});

// ── API Routes
app.use('/api/auth',      authRoutes);
app.use('/api/doctors',   doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/leads',     leadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/promote',   promoteRoutes);

// ── 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

// ── Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectMySQL();
  await ensureSeedData();
  app.listen(PORT, () => {
    console.log(`\n🚀 ICC Backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

startServer().catch((error) => {
  console.error(`❌ ICC backend failed to start: ${error.message}`);
  process.exit(1);
});
