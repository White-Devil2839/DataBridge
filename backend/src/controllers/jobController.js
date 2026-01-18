import { prisma } from '../utils/prisma.js';

export const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, connectorId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // If not admin, only show jobs for connectors owned by the user
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (connectorId) {
      where.connectorId = connectorId;
    }

    const [jobs, total] = await Promise.all([
      prisma.syncJob.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          connector: {
            select: {
              id: true,
              name: true,
              baseUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: {
              rawApiData: true,
              normalizedData: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.syncJob.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.syncJob.findUnique({
      where: { id },
      include: {
        connector: {
          select: {
            id: true,
            name: true,
            baseUrl: true,
            authType: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            rawApiData: true,
            normalizedData: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user has access (admin or owner)
    if (req.user.role !== 'ADMIN' && job.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retry a failed job
 * POST /api/jobs/:id/retry
 */
export const retryJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.syncJob.findUnique({
      where: { id },
      include: {
        connector: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only allow retrying failed jobs
    if (job.status !== 'FAILED') {
      return res.status(400).json({
        error: 'Only failed jobs can be retried',
        currentStatus: job.status,
      });
    }

    // Check if user has access (admin only for retry)
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can retry jobs' });
    }

    // Import triggerSync dynamically to avoid circular dependency
    const { triggerSync } = await import('../services/syncService.js');

    // Create a new sync job for the same connector
    const newJob = await triggerSync(job.connectorId, req.user.id);

    res.json({
      message: 'Retry job started successfully',
      originalJobId: id,
      newJob,
    });
  } catch (error) {
    console.error('Retry job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
