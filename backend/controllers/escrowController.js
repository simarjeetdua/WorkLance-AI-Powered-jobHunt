import Escrow from "../models/Escrow.model.js";
import Job from "../models/Job.model.js";
import Application from "../models/Application.model.js";
import Transaction from "../models/Transaction.model.js";
import { createNotification } from "./notificationController.js";

/**
 * 💰 CREATE ESCROW (Client - Legacy / Direct funding)
 */
export const createEscrow = async (req, res) => {
  try {
    const { jobId, freelancerId, amount, applicationId } = req.body;

    if (!jobId || !freelancerId || !amount || !applicationId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const existing = await Escrow.findOne({ application: applicationId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Escrow already funded for this application",
      });
    }

    const escrow = await Escrow.create({
      job: jobId,
      application: applicationId,
      client: req.user.id,
      freelancer: freelancerId,
      amount,
      status: "held_in_escrow",
      fundedAt: new Date(),
    });

    // Create a transaction record
    const txId = `WL-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    await Transaction.create({
      escrow: escrow._id,
      amount,
      paymentMethod: "upi",
      status: "success",
      transactionId: txId,
      receiptUrl: `/receipts/${txId}.pdf`,
    });

    // Update application and job status
    await Application.findByIdAndUpdate(applicationId, { status: "hired" });
    await Job.findByIdAndUpdate(jobId, { status: "in-progress" });

    // Send notifications
    await createNotification({
      recipient: freelancerId,
      type: "escrow",
      priority: "high",
      title: "Escrow Funded 💰",
      message: `${req.user.name || "Client"} has funded $${amount} in escrow for "${job.title}". You can now start working.`,
      link: "/dashboard/escrow",
    });

    res.status(201).json({
      success: true,
      message: "Escrow funded successfully 💰",
      escrow,
    });
  } catch (error) {
    console.error("CREATE ESCROW ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📂 SUBMIT WORK (Freelancer)
 */
export const submitWork = async (req, res) => {
  try {
    const { workNotes, workAttachment } = req.body;
    const escrow = await Escrow.findById(req.params.id)
      .populate("client", "name")
      .populate("job", "title");

    if (!escrow) {
      return res.status(404).json({ success: false, message: "Escrow not found" });
    }

    if (escrow.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the assigned freelancer can submit work" });
    }

    if (["held_in_escrow", "funded", "client_review_pending"].indexOf(escrow.status) === -1) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit work when escrow is in status: ${escrow.status}`,
      });
    }

    escrow.status = "work_submitted";
    escrow.workNotes = workNotes || "";
    escrow.workAttachment = workAttachment || "";
    escrow.submittedAt = new Date();
    await escrow.save();

    // Notify client
    await createNotification({
      recipient: escrow.client,
      sender: req.user.id,
      type: "escrow",
      priority: "high",
      title: "Work Submitted for Review 📂",
      message: `${req.user.name || "Freelancer"} has submitted work for "${escrow.job.title}". Please review it.`,
      link: "/dashboard/escrow",
    });

    res.status(200).json({
      success: true,
      message: "Work submitted successfully! Pending client review.",
      escrow,
    });
  } catch (error) {
    console.error("SUBMIT WORK ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 👀 CLIENT REVIEW WORK (Client)
 * Allows client to approve/release or request revision (puts back in review_pending/revision)
 */
export const reviewWork = async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'approve' or 'revision'
    const escrow = await Escrow.findById(req.params.id)
      .populate("freelancer", "name")
      .populate("job", "title");

    if (!escrow) {
      return res.status(404).json({ success: false, message: "Escrow not found" });
    }

    if (escrow.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the client can review work" });
    }

    if (escrow.status !== "work_submitted") {
      return res.status(400).json({
        success: false,
        message: "No work has been submitted for review",
      });
    }

    if (action === "approve") {
      // Release payment
      escrow.status = "released";
      escrow.releasedAt = new Date();
      await escrow.save();

      // Create transaction record
      const txId = `WL-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      await Transaction.create({
        escrow: escrow._id,
        amount: escrow.amount,
        paymentMethod: "upi",
        status: "success",
        transactionId: txId,
        receiptUrl: `/receipts/${txId}.pdf`,
      });

      // Update Job status
      await Job.findByIdAndUpdate(escrow.job._id, { status: "completed" });

      // Notify freelancer
      await createNotification({
        recipient: escrow.freelancer._id,
        type: "payment",
        priority: "high",
        title: "Funds Released! 🚀",
        message: `${req.user.name || "Client"} approved your work and released $${escrow.amount} from escrow.`,
        link: "/dashboard/escrow",
      });

      return res.status(200).json({
        success: true,
        message: "Work approved and payment released successfully! 🚀",
        escrow,
      });
    } else if (action === "revision") {
      escrow.status = "client_review_pending";
      escrow.note = notes || "Revision requested";
      await escrow.save();

      // Notify freelancer
      await createNotification({
        recipient: escrow.freelancer._id,
        type: "escrow",
        priority: "medium",
        title: "Revision Requested 🔁",
        message: `${req.user.name || "Client"} has requested revisions for "${escrow.job.title}". Check feedback notes.`,
        link: "/dashboard/escrow",
      });

      return res.status(200).json({
        success: true,
        message: "Revision requested and freelancer notified.",
        escrow,
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'approve' or 'revision'." });
    }
  } catch (error) {
    console.error("REVIEW WORK ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ⚠️ RAISE DISPUTE
 */
export const raiseDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    const escrow = await Escrow.findById(req.params.id)
      .populate("client", "name")
      .populate("freelancer", "name")
      .populate("job", "title");

    if (!escrow) {
      return res.status(404).json({ success: false, message: "Escrow not found" });
    }

    if (
      escrow.client._id.toString() !== req.user.id &&
      escrow.freelancer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to dispute this escrow" });
    }

    if (["released", "refunded"].indexOf(escrow.status) !== -1) {
      return res.status(400).json({ success: false, message: "Cannot dispute processed payments" });
    }

    escrow.status = "disputed";
    escrow.disputeReason = reason || "Unspecified dispute";
    escrow.disputedAt = new Date();
    await escrow.save();

    // Notify both parties
    await createNotification({
      recipient: escrow.client._id,
      type: "escrow",
      priority: "high",
      title: "Dispute Opened ⚠️",
      message: `A dispute has been opened for "${escrow.job.title}". Support will review the case.`,
      link: "/dashboard/escrow",
    });

    await createNotification({
      recipient: escrow.freelancer._id,
      type: "escrow",
      priority: "high",
      title: "Dispute Opened ⚠️",
      message: `A dispute has been opened for "${escrow.job.title}". Support will review the case.`,
      link: "/dashboard/escrow",
    });

    res.status(200).json({
      success: true,
      message: "Dispute raised successfully. Support team notified.",
      escrow,
    });
  } catch (error) {
    console.error("DISPUTE ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🚀 RELEASE PAYMENT (Client)
 */
export const releaseEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id)
      .populate("freelancer", "name")
      .populate("job", "title");

    if (!escrow) {
      return res.status(404).json({ success: false, message: "Escrow not found" });
    }

    if (escrow.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (["released", "refunded"].indexOf(escrow.status) !== -1) {
      return res.status(400).json({ success: false, message: "Payment already processed" });
    }

    escrow.status = "released";
    escrow.releasedAt = new Date();
    await escrow.save();

    const txId = `WL-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const transaction = await Transaction.create({
      escrow: escrow._id,
      amount: escrow.amount,
      paymentMethod: "upi",
      status: "success",
      transactionId: txId,
      receiptUrl: `/receipts/${txId}.pdf`,
    });

    await Job.findByIdAndUpdate(escrow.job, { status: "completed" });

    // Send notifications
    await createNotification({
      recipient: escrow.freelancer._id,
      type: "payment",
      priority: "high",
      title: "Funds Released! 🚀",
      message: `${req.user.name || "Client"} has released $${escrow.amount} from escrow for "${escrow.job.title}".`,
      link: "/dashboard/escrow",
    });

    res.status(200).json({
      success: true,
      message: "Payment released successfully 🚀",
      escrow,
      transaction,
    });
  } catch (error) {
    console.error("RELEASE ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔁 REFUND ESCROW (Client + Admin)
 */
export const refundEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id)
      .populate("client", "name")
      .populate("freelancer", "name")
      .populate("job", "title");

    if (!escrow) {
      return res.status(404).json({ success: false, message: "Escrow not found" });
    }

    if (
      escrow.client._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (["released", "refunded"].indexOf(escrow.status) !== -1) {
      return res.status(400).json({ success: false, message: "Cannot refund processed escrow" });
    }

    escrow.status = "refunded";
    escrow.refundedAt = new Date();
    await escrow.save();

    // Create a transaction log for refund
    const txId = `WL-RF-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    await Transaction.create({
      escrow: escrow._id,
      amount: escrow.amount,
      paymentMethod: "upi",
      status: "success",
      transactionId: txId,
      receiptUrl: `/receipts/${txId}.pdf`,
    });

    // Notify freelancer and client
    await createNotification({
      recipient: escrow.client._id,
      type: "payment",
      priority: "high",
      title: "Refund Processed ↩️",
      message: `Your refund of $${escrow.amount} for "${escrow.job.title}" has been credited back to your account.`,
      link: "/dashboard/escrow",
    });

    await createNotification({
      recipient: escrow.freelancer._id,
      type: "escrow",
      priority: "medium",
      title: "Payment Refunded ↩️",
      message: `The escrow of $${escrow.amount} for "${escrow.job.title}" has been refunded to the client.`,
      link: "/dashboard/escrow",
    });

    res.status(200).json({
      success: true,
      message: "Escrow refunded successfully",
      escrow,
    });
  } catch (error) {
    console.error("REFUND ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📦 GET ESCROW BY JOB
 */
export const getEscrowByJob = async (req, res) => {
  try {
    const escrow = await Escrow.findOne({ job: req.params.jobId })
      .populate("client", "username name email role avatar")
      .populate("freelancer", "username name email role avatar");

    if (!escrow) {
      return res.status(404).json({ success: false, message: "Escrow not found" });
    }

    res.status(200).json({ success: true, escrow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 👤 GET MY ESCROWS
 */
export const getMyEscrows = async (req, res) => {
  try {
    const escrows = await Escrow.find({
      $or: [{ client: req.user.id }, { freelancer: req.user.id }],
    })
      .populate("job", "title budget status")
      .populate("client", "username name role avatar")
      .populate("freelancer", "username name role avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, escrows });
  } catch (error) {
    console.error("GET ESCROW ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📈 GET MY TRANSACTIONS
 */
export const getMyTransactions = async (req, res) => {
  try {
    // Find escrows where user is client or freelancer
    const escrows = await Escrow.find({
      $or: [{ client: req.user.id }, { freelancer: req.user.id }],
    });

    const escrowIds = escrows.map(e => e._id);

    // Find transactions associated with these escrows
    const transactions = await Transaction.find({ escrow: { $in: escrowIds } })
      .populate({
        path: "escrow",
        populate: [
          { path: "job", select: "title" },
          { path: "client", select: "name avatar" },
          { path: "freelancer", select: "name avatar" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("GET MY TRANSACTIONS ERROR ❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
};