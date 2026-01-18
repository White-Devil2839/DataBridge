import express from 'express';
import { body } from 'express-validator';
import {
  getConnectors,
  getConnector,
  createConnector,
  updateConnector,
  deleteConnector,
  triggerSyncJob,
  listTemplates,
  getTemplate,
  createFromTemplate,
} from '../controllers/connectorController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const validateConnector = [
  body('name').notEmpty().withMessage('Name is required'),
  body('baseUrl').isURL().withMessage('Base URL must be a valid URL'),
  body('authType').optional().isIn(['NONE', 'API_KEY', 'BEARER']).withMessage('Invalid auth type'),
];

// Template routes (must come before /:id routes to avoid conflicts)
router.get('/templates', listTemplates);
router.get('/templates/:templateId', getTemplate);
router.post('/from-template', requireAdmin, createFromTemplate);

// CRUD Routes
router.get('/', getConnectors);
router.get('/:id', getConnector);
router.post('/', requireAdmin, validateConnector, createConnector);
router.put('/:id', requireAdmin, validateConnector, updateConnector);
router.delete('/:id', requireAdmin, deleteConnector);
router.post('/:id/sync', requireAdmin, triggerSyncJob);

export default router;
