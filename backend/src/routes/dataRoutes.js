import express from 'express';
import { getRawData, getNormalizedData, exportNormalizedData } from '../controllers/dataController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/raw', getRawData);
router.get('/normalized', getNormalizedData);
router.get('/normalized/export', exportNormalizedData);

export default router;
