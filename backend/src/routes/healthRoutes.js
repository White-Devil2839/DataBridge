import express from 'express';
import { prisma } from '../utils/prisma.js';

const router = express.Router();

// Store server start time
const startTime = Date.now();

/**
 * GET /api/health
 * Comprehensive health check endpoint
 */
router.get('/', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {},
    };

    // Check database connectivity
    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        health.services.database = {
            status: 'healthy',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        health.status = 'degraded';
        health.services.database = {
            status: 'unhealthy',
            error: error.message,
        };
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    health.memory = {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        unit: 'MB',
    };

    // Determine status code based on health
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});

/**
 * GET /api/health/ready
 * Readiness probe - returns 200 if the service is ready to accept traffic
 */
router.get('/ready', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ready: true, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(503).json({
            ready: false,
            timestamp: new Date().toISOString(),
            error: 'Database not available',
        });
    }
});

/**
 * GET /api/health/live
 * Liveness probe - returns 200 if the service is running
 */
router.get('/live', (req, res) => {
    res.json({ alive: true, timestamp: new Date().toISOString() });
});

/**
 * GET /api/health/stats
 * System statistics - detailed backend metrics for admin dashboard
 */
router.get('/stats', async (req, res) => {
    try {
        // Get database stats
        const [connectorCount, jobCount, recentJobs] = await Promise.all([
            prisma.connector.count(),
            prisma.syncJob.count(),
            prisma.syncJob.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
        ]);

        const jobsByStatus = recentJobs.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {});

        // Get memory usage
        const memoryUsage = process.memoryUsage();

        res.json({
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - startTime) / 1000),

            // System info
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            pid: process.pid,
            environment: process.env.NODE_ENV || 'development',

            // Memory info (raw bytes for frontend to format)
            memoryUsage: {
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
                rss: memoryUsage.rss,
                external: memoryUsage.external,
            },

            // Database stats
            connectors: connectorCount,
            jobs: {
                total: jobCount,
                byStatus: jobsByStatus,
            },
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch stats',
            message: error.message,
        });
    }
});

export default router;

