import express from 'express';
import { createPortfolio, getUserPortfolio, updatePortfolio, deletePortfolio} from '../controllers/PortfolioController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

//create portfolio
router.post('/', protect, createPortfolio);
//get user portfolio
router.get('/:userId', protect, getUserPortfolio);
//update
router.put('/:id', protect, updatePortfolio);
//delete
router.delete('/:id', protect, deletePortfolio);

export default router;