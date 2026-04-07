import express from 'express';
import {
  applyForJob,
  getJobApplications,
  getClientApplications,
  updateApplicationStatus,
  getMyApplications
} from '../controllers/applicationController.js';

import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ✅ APPLY
router.post('/:jobId/apply', protect, authorizeRoles('freelancer'), applyForJob);

// ✅ CLIENT ALL APPLICATIONS
router.get('/client/all', protect, authorizeRoles('client'), getClientApplications);

// ✅ JOB APPLICATIONS
router.get('/:jobId/applications', protect, authorizeRoles('client', 'admin'), getJobApplications);

// ✅ UPDATE STATUS
router.put('/:id/status', protect, authorizeRoles('admin','client'), updateApplicationStatus);

// ✅ FREELANCER APPLICATIONS
router.get('/me', protect, authorizeRoles('freelancer'), getMyApplications);

export default router;