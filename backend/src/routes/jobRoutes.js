import express from 'express';
import { getJobs, getJob, retryJob } from '../controllers/jobController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/:id/retry', retryJob);

export default router;
