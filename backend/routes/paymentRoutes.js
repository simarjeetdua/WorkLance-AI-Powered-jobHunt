import express from "express";
import {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  getPayments
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/initiate", protect, authorizeRoles("client"), initiatePayment);
router.post("/verify", protect, authorizeRoles("client"), verifyPayment);
router.get("/history", protect, getPaymentHistory);
router.get("/", protect, getPayments);

export default router;
