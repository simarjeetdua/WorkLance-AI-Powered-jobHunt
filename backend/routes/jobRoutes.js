import express from 'express';
import {
  createJob,
  getAllJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  getMyJobs   // ✅ ADD THIS
} from '../controllers/jobController.js';

import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ✅ CREATE JOB (only client/admin)
router.post('/', protect, authorizeRoles('admin', 'client'), createJob);

// ✅ GET ALL JOBS
router.get('/', getAllJobs);

// ✅ GET MY JOBS (🔥 IMPORTANT FIX)
router.get('/my/jobs', protect, authorizeRoles('client'), getMyJobs);

// ✅ GET SINGLE JOB
router.get('/:id', getSingleJob);

// ✅ UPDATE JOB
router.put('/:id', protect, authorizeRoles('admin', 'client'), updateJob);

// ✅ DELETE JOB
router.delete('/:id', protect, authorizeRoles('admin', 'client'), deleteJob);

export default router;