import express from "express";
import {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getMyEscrows,
  getEscrowByJob,
} from "../controllers/escrowController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * 💰 CREATE ESCROW (Client only)
 */
router.post(
  "/",
  protect,
  authorizeRoles("client"),
  createEscrow
);

/**
 * 🚀 RELEASE PAYMENT (Client only)
 */
router.post(
  "/:id/release",
  protect,
  authorizeRoles("client"),
  releaseEscrow
);

/**
 * 🔁 REFUND ESCROW (Client + Admin)
 */
router.post(
  "/:id/refund",
  protect,
  authorizeRoles("client", "admin"),
  refundEscrow
);

/**
 * 👤 GET MY ESCROWS (Client + Freelancer)
 */
router.get(
  "/me",
  protect,
  getMyEscrows
);

/**
 * 📦 GET ESCROW BY JOB
 */
router.get(
  "/job/:jobId",
  protect,
  getEscrowByJob
);

export default router;