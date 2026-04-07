import express from 'express';
import { createOrUpdateProfile, getMyProfile, getProfileByUserId, deleteProfile} from '../controllers/profileController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

//create or update profile
router.post('/', protect, createOrUpdateProfile);
//get my prof
router.get('/me', protect, getMyProfile);
// get prof bu user id
router.get('/:userId', protect, getProfileByUserId);
//delete
router.delete('/', protect,deleteProfile);

export default router;