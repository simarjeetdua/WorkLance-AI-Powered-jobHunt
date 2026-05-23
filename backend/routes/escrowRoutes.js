import express from "express";
import {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getMyEscrows,
  getEscrowByJob,
  submitWork,
  reviewWork,
  raiseDispute,
  getMyTransactions,
} from "../controllers/escrowController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * 👤 GET MY TRANSACTIONS
 */
router.get("/transactions", protect, getMyTransactions);

/**
 * 💰 CREATE ESCROW (Client only)
 */
router.post("/", protect, authorizeRoles("client"), createEscrow);

/**
 * 🚀 RELEASE PAYMENT (Client only)
 */
router.post("/:id/release", protect, authorizeRoles("client"), releaseEscrow);

/**
 * 🔁 REFUND ESCROW (Client + Admin)
 */
router.post("/:id/refund", protect, authorizeRoles("client", "admin"), refundEscrow);

/**
 * 📂 SUBMIT WORK (Freelancer only)
 */
router.post("/:id/submit", protect, authorizeRoles("freelancer"), submitWork);

/**
 * 👀 CLIENT REVIEW WORK (Client only)
 */
router.post("/:id/review", protect, authorizeRoles("client"), reviewWork);

/**
 * ⚠️ DISPUTE ESCROW (Client + Freelancer)
 */
router.post("/:id/dispute", protect, raiseDispute);

/**
 * 👤 GET MY ESCROWS (Client + Freelancer)
 */
router.get("/me", protect, getMyEscrows);

/**
 * 📦 GET ESCROW BY JOB
 */
router.get("/job/:jobId", protect, getEscrowByJob);
router.get("/:jobId", protect, getEscrowByJob);

export default router;