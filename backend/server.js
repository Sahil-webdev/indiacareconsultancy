require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { connectMySQL } = require('./src/config/mysql');
const { ensureSeedData } = require('./src/services/seedDemoData');
const { ensureOperationalSchema } = require('./src/services/schemaMaintenance');
const { captureSuccessfulApiActivity } = require('./src/services/auditLogger');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// ── Routes
const authRoutes     = require('./src/routes/auth');
const doctorRoutes   = require('./src/routes/doctors');
const hospitalRoutes = require('./src/routes/hospitals');
const leadRoutes     = require('./src/routes/leads');
const promoteRoutes  = require('./src/routes/promote');
const appointmentRoutes = require('./src/routes/appointments');
const followUpRoutes = require('./src/routes/followUps');
const patientRoutes = require('./src/routes/patients');
const employeeRoutes = require('./src/routes/employees');
const expiringDocsRoutes = require('./src/routes/expiringDocs');
const subscriptionRoutes = require('./src/routes/subscriptions');
const specialitiesRoutes = require('./src/routes/specialities');
const notificationRoutes = require('./src/routes/notifications');
const profileChangeRequestRoutes = require('./src/routes/profileChangeRequests');
const actionCentreRoutes = require('./src/routes/actionCentre');

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
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Handle OPTIONS preflight for all routes
app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parser
app.use(express.json());

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ICC Backend is running 🚀', env: process.env.NODE_ENV });
});

// ── API Routes
app.use('/api',               captureSuccessfulApiActivity);
app.use('/api/auth',          authRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/hospitals',     hospitalRoutes);
app.use('/api/leads',         leadRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/follow-ups',    followUpRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/employees',     employeeRoutes);
app.use('/api/expiring-docs', expiringDocsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/promote',       promoteRoutes);
app.use('/api/specialities',  specialitiesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile-change-requests', profileChangeRequestRoutes);
app.use('/api/action-centre', actionCentreRoutes);

// ── 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

// ── Start server
const PORT = process.env.PORT || 5000;

async function checkExistingBackend(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.success ? payload : null;
  } catch {
    return null;
  }
}

async function startServer() {
  await connectMySQL();
  await ensureOperationalSchema();
  await ensureSeedData();
  const server = http.createServer(app);

  server.on('error', async (error) => {
    if (error.code === 'EADDRINUSE') {
      const existingBackend = await checkExistingBackend(PORT);
      if (existingBackend) {
        console.log(`\nℹ️  ICC backend is already running on http://localhost:${PORT}`);
        console.log(`   Existing health check: http://localhost:${PORT}/api/health`);
        console.log('   No new server was started because the current port is already in use.\n');
        return;
      }

      console.error(`\n❌ Port ${PORT} is already in use by another process.`);
      console.error(`   Free the port or change PORT in backend/.env and try again.\n`);
      return;
    }

    console.error(`❌ ICC backend failed to start: ${error.message}`);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`\n🚀 ICC Backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

startServer().catch((error) => {
  console.error(`❌ ICC backend failed to start: ${error.message}`);
  process.exit(1);
});
