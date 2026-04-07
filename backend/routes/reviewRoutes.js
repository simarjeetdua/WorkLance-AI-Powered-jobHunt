import express from 'express';
import { createReview, getUserReviews} from '../controllers/reviewController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

//creste review
router.post('/:jobId', protect, createReview)
//get user review
router.get('/:userId', protect, getUserReviews);

export default router;