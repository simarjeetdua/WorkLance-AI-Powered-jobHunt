import express from 'express';
import { getJobRecommendations} from '../controllers/recommendationController.js';
import {protect} from '../middleware/authMiddleware.js';
import {authorizeRoles} from '../middleware/roleMiddleware.js';

const router = express.Router();

//get job recomm
router.get('/jobs', protect, authorizeRoles('freelancer'), getJobRecommendations);

export default router;