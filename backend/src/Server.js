import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import connectorRoutes from './routes/connectorRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/connectors', connectorRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/health', healthRoutes);

// Legacy health check endpoint (for backwards compatibility)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

  // Start the scheduler for automated syncing
  startScheduler();
});

export default app;
