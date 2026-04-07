import express from 'express';
import { getAllUsers, deleteUser} from '../controllers/adminController.js';
import {protect} from '../middleware/authMiddleware.js';
import {authorizeRoles} from '../middleware/roleMiddleware.js';

const router = express.Router();

//get all users
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
//delete user
router.delete('/users/:id', protect, authorizeRoles('admin'),deleteUser);

export default router;