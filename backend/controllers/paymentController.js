import Escrow from "../models/Escrow.model.js";
import Transaction from "../models/Transaction.model.js";
import Job from "../models/Job.model.js";
import Application from "../models/Application.model.js";
import { createNotification } from "./notificationController.js";

/**
 * 💳 INITIATE PAYMENT (Client)
 * Creates a pending escrow structure waiting to be funded
 */
export const initiatePayment = async (req, res) => {
  try {
    const { jobId, freelancerId, amount, applicationId } = req.body;

    if (!jobId || !freelancerId || !amount || !applicationId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required to initiate payment",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to pay for this job" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Reuse existing escrow if it's already pending payment, to avoid duplicates
    let escrow = await Escrow.findOne({ application: applicationId });

    if (escrow) {
      if (escrow.status !== "payment_pending") {
        return res.status(400).json({
          success: false,
          message: "Escrow payment has already been funded or processed",
          escrow,
        });
      }
      // Update amount in case it changed
      escrow.amount = amount;
      await escrow.save();
    } else {
      escrow = await Escrow.create({
        job: jobId,
        application: applicationId,
        client: req.user.id,
        freelancer: freelancerId,
        amount,
        status: "payment_pending",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment session initiated 💳",
      escrowId: escrow._id,
      amount: escrow.amount,
    });
  } catch (error) {
    console.error("INITIATE PAYMENT ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🛡️ VERIFY PAYMENT (Simulated Cashfree Checkout Verification)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { escrowId, paymentMethod, status } = req.body;

    if (!escrowId || !paymentMethod || !status) {
      return res.status(400).json({
        success: false,
        message: "Escrow ID, payment method, and status are required for verification",
      });
    }

    const escrow = await Escrow.findById(escrowId)
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .populate("job", "title");

    if (!escrow) {
      return res.status(404).json({ success: false, message: "Escrow record not found" });
    }

    if (escrow.status !== "payment_pending") {
      return res.status(400).json({
        success: false,
        message: `Escrow cannot be verified because its current status is: ${escrow.status}`,
      });
    }

    const txId = `WL-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    if (status === "success") {
      // 1. Update Escrow status to funded/held_in_escrow
      escrow.status = "held_in_escrow";
      escrow.fundedAt = new Date();
      await escrow.save();

      // 2. Create success Transaction
      const transaction = await Transaction.create({
        escrow: escrow._id,
        amount: escrow.amount,
        paymentMethod,
        status: "success",
        transactionId: txId,
        receiptUrl: `/receipts/${txId}.pdf`,
      });

      // 3. Update application status to "hired" automatically when client pays escrow
      await Application.findByIdAndUpdate(escrow.application, { status: "hired" });
      
      // Optional: Set job status to "in-progress"
      await Job.findByIdAndUpdate(escrow.job, { status: "in-progress" });

      // 4. Send Notifications
      // To Client
      await createNotification({
        recipient: escrow.client._id,
        type: "payment",
        priority: "high",
        title: "Payment Successful 🎉",
        message: `Your payment of $${escrow.amount} for "${escrow.job.title}" was processed successfully. Funds are held securely in Escrow.`,
        link: "/dashboard/escrow",
      });

      // To Freelancer
      await createNotification({
        recipient: escrow.freelancer._id,
        type: "escrow",
        priority: "high",
        title: "Escrow Funded 💰",
        message: `${escrow.client.name} has funded the escrow of $${escrow.amount} for "${escrow.job.title}". You can start working now!`,
        link: "/dashboard/escrow",
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified and Escrow funded successfully!",
        transaction,
        escrow,
      });
    } else {
      // Create failed Transaction
      const transaction = await Transaction.create({
        escrow: escrow._id,
        amount: escrow.amount,
        paymentMethod,
        status: "failed",
        transactionId: txId,
      });

      await createNotification({
        recipient: escrow.client._id,
        type: "payment",
        priority: "medium",
        title: "Payment Failed ❌",
        message: `Your simulated payment of $${escrow.amount} for "${escrow.job.title}" failed. Please try again.`,
        link: "/dashboard/escrow",
      });

      return res.status(400).json({
        success: false,
        message: "Simulated payment failed",
        transaction,
      });
    }
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🧾 GET PAYMENT HISTORY (Client or Freelancer)
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const escrows = await Escrow.find({
      $or: [{ client: req.user.id }, { freelancer: req.user.id }],
    });

    const escrowIds = escrows.map(e => e._id);

    const transactions = await Transaction.find({ escrow: { $in: escrowIds } })
      .populate({
        path: "escrow",
        populate: [
          { path: "job", select: "title" },
          { path: "client", select: "name username avatar" },
          { path: "freelancer", select: "name username avatar" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("GET PAYMENT HISTORY ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🧾 GET ALL PAYMENTS (Alias or list of user's transactions)
 */
export const getPayments = async (req, res) => {
  return getPaymentHistory(req, res);
};
