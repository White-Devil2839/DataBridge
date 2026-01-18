import { prisma } from '../utils/prisma.js';
import { validationResult } from 'express-validator';
import { triggerSync } from '../services/syncService.js';

export const getConnectors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Scoping for visibility:
    // ADMIN: Sees all connectors
    // USER: Sees their own connectors + connectors marked as shared
    const where = req.user.role === 'ADMIN'
      ? {}
      : {
        OR: [
          { userId: req.user.id },
          { isShared: true }
        ]
      };

    const [connectors, total] = await Promise.all([
      prisma.connector.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: {
              syncJobs: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.connector.count({ where }),
    ]);

    res.json({
      connectors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get connectors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConnector = async (req, res) => {
  try {
    const { id } = req.params;

    const connector = await prisma.connector.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            syncJobs: true,
            normalizedData: true,
          },
        },
      },
    });

    if (!connector) {
      return res.status(404).json({ error: 'Connector not found' });
    }

    // Check if user has access:
    // 1. Admins have access to everything
    // 2. Owners have access to their own connectors
    // 3. Shared connectors are visible to all
    const hasAccess =
      req.user.role === 'ADMIN' ||
      connector.userId === req.user.id ||
      connector.isShared;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ connector });
  } catch (error) {
    console.error('Get connector error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createConnector = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      baseUrl,
      authType,
      authConfig,
      rateLimitConfig,
      endpointConfig,
      fieldMappingConfig,
      isShared,
    } = req.body;

    // Regular users cannot create shared connectors
    const finalIsShared = req.user.role === 'ADMIN' ? (isShared === true || isShared === 'true') : false;

    const connector = await prisma.connector.create({
      data: {
        name,
        baseUrl,
        authType: authType || 'NONE',
        authConfig: authConfig || {},
        rateLimitConfig: rateLimitConfig || {},
        endpointConfig: endpointConfig || [],
        fieldMappingConfig: fieldMappingConfig || {},
        isShared: finalIsShared,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Connector created successfully',
      connector,
    });
  } catch (error) {
    console.error('Create connector error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateConnector = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      baseUrl,
      authType,
      authConfig,
      rateLimitConfig,
      endpointConfig,
      fieldMappingConfig,
      isShared,
    } = req.body;

    // Check if connector exists
    const existing = await prisma.connector.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Connector not found' });
    }

    // Check permissions: only admin or owner can update
    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to update this connector' });
    }

    // Regular users cannot change sharing status
    const finalIsShared = req.user.role === 'ADMIN' && isShared !== undefined
      ? (isShared === true || isShared === 'true')
      : existing.isShared;

    const connector = await prisma.connector.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(baseUrl && { baseUrl }),
        ...(authType && { authType }),
        ...(authConfig !== undefined && { authConfig }),
        ...(rateLimitConfig !== undefined && { rateLimitConfig }),
        ...(endpointConfig !== undefined && { endpointConfig }),
        ...(fieldMappingConfig !== undefined && { fieldMappingConfig }),
        isShared: finalIsShared,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Connector updated successfully',
      connector,
    });
  } catch (error) {
    console.error('Update connector error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteConnector = async (req, res) => {
  try {
    const { id } = req.params;

    const connector = await prisma.connector.findUnique({
      where: { id },
    });

    if (!connector) {
      return res.status(404).json({ error: 'Connector not found' });
    }

    // Check permissions: only admin or owner can delete
    if (req.user.role !== 'ADMIN' && connector.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this connector' });
    }

    await prisma.connector.delete({
      where: { id },
    });

    res.json({ message: 'Connector deleted successfully' });
  } catch (error) {
    console.error('Delete connector error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const triggerSyncJob = async (req, res) => {
  try {
    const { id } = req.params;

    const connector = await prisma.connector.findUnique({
      where: { id },
    });

    if (!connector) {
      return res.status(404).json({ error: 'Connector not found' });
    }

    // Check permissions: admin, owner, or shared connector (all users can trigger sync for shared)
    const canSync =
      req.user.role === 'ADMIN' ||
      connector.userId === req.user.id ||
      connector.isShared;

    if (!canSync) {
      return res.status(403).json({ error: 'You do not have permission to trigger sync for this connector' });
    }

    // Trigger sync job (async)
    const syncJob = await triggerSync(connector.id, req.user.id);

    res.status(202).json({
      message: 'Sync job triggered',
      syncJob: {
        id: syncJob.id,
        status: syncJob.status,
        connectorId: syncJob.connectorId,
        createdAt: syncJob.createdAt,
      },
    });
  } catch (error) {
    console.error('Trigger sync error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Template endpoints
import { getTemplates, getTemplateById, getCategories } from '../data/connectorTemplates.js';

/**
 * Get all connector templates
 * GET /api/connectors/templates
 */
export const listTemplates = async (req, res) => {
  try {
    const templates = getTemplates();
    const categories = getCategories();

    res.json({
      templates,
      categories,
    });
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a specific template by ID
 * GET /api/connectors/templates/:templateId
 */
export const getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = getTemplateById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create connector from template
 * POST /api/connectors/from-template
 */
export const createFromTemplate = async (req, res) => {
  try {
    const { templateId, name, authConfig, isShared } = req.body;

    const template = getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Regular users cannot create shared connectors
    const finalIsShared = req.user.role === 'ADMIN' ? (isShared === true || isShared === 'true') : false;

    // Merge provided authConfig with template defaults
    const mergedAuthConfig = {
      ...template.authConfig,
      ...authConfig,
    };

    const connector = await prisma.connector.create({
      data: {
        name: name || template.name,
        baseUrl: template.baseUrl,
        authType: template.authType,
        authConfig: mergedAuthConfig,
        rateLimitConfig: template.rateLimitConfig,
        endpointConfig: template.endpointConfig,
        fieldMappingConfig: template.fieldMappingConfig,
        isShared: finalIsShared,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Connector created from template successfully',
      connector,
      template: {
        id: template.id,
        name: template.name,
        provider: template.provider,
      },
    });
  } catch (error) {
    console.error('Create from template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
