import express from 'express';
import { createReview, getUserReviews, updateReview, deleteReview } from '../controllers/reviewController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

//creste review
router.post('/:jobId', protect, createReview)
//get user review
router.get('/:userId', protect, getUserReviews);
//update review
router.put('/:id', protect, updateReview);
//delete review
router.delete('/:id', protect, deleteReview);

export default router;