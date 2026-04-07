import express from 'express';
import { analyticsDashboard} from '../controllers/analyticsController.js';
import {protect} from '../middleware/authMiddleware.js';
import {authorizeRoles} from '../middleware/roleMiddleware.js';

const router = express.Router();

//analytics dashboard
router.get('/dashboard', protect, authorizeRoles('admin'), analyticsDashboard);

export default router;