import Escrow from "../models/Escrow.model.js";
import Job from "../models/Job.model.js";
import Application from "../models/Application.model.js";
import Transaction from "../models/Transaction.model.js";

/**
 * 💰 CREATE ESCROW (Client)
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

    // ✅ Check job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ✅ Only client can fund
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ✅ Check application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // ✅ Prevent duplicate escrow per application
    const existing = await Escrow.findOne({ application: applicationId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Escrow already funded for this application",
      });
    }

    // ✅ Create escrow
    const escrow = await Escrow.create({
      job: jobId,
      application: applicationId,
      client: req.user.id,
      freelancer: freelancerId,
      amount,
      status: "funded",
    });

    res.status(201).json({
      success: true,
      message: "Escrow funded successfully 💰",
      escrow,
    });

  } catch (error) {
    console.error("CREATE ESCROW ERROR ❌", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * 🚀 RELEASE PAYMENT (Client)
 */
export const releaseEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    // ✅ Only client
    if (escrow.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ✅ Check status
    if (escrow.status !== "funded") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    // ✅ Update escrow
    escrow.status = "released";
    escrow.releasedAt = new Date();
    await escrow.save();

    // ✅ Create transaction
    const transaction = await Transaction.create({
      escrow: escrow._id,
      amount: escrow.amount,
      paymentMethod: "upi",
      status: "success",
    });

    res.status(200).json({
      success: true,
      message: "Payment released successfully 🚀",
      escrow,
      transaction,
    });

  } catch (error) {
    console.error("RELEASE ERROR ❌", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * 🔁 REFUND ESCROW
 */
export const refundEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    if (
      escrow.client.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (escrow.status !== "funded") {
      return res.status(400).json({
        success: false,
        message: "Cannot refund processed escrow",
      });
    }

    escrow.status = "refunded";
    escrow.refundedAt = new Date();
    await escrow.save();

    res.status(200).json({
      success: true,
      message: "Escrow refunded successfully",
      escrow,
    });

  } catch (error) {
    console.error("REFUND ERROR ❌", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * 📦 GET ESCROW BY JOB
 */
export const getEscrowByJob = async (req, res) => {
  try {
    const escrow = await Escrow.findOne({
      job: req.params.jobId,
    })
      .populate("client", "username name email role avatar")
      .populate("freelancer", "username name email role avatar");

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: "Escrow not found",
      });
    }

    res.status(200).json({
      success: true,
      escrow,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * 👤 GET MY ESCROWS
 */
export const getMyEscrows = async (req, res) => {
  try {
    const escrows = await Escrow.find({
      $or: [
        { client: req.user.id },
        { freelancer: req.user.id },
      ],
    })
      .populate("job", "title")
      .populate("client", "username name role avatar")
      .populate("freelancer", "username name role avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      escrows,
    });

  } catch (error) {
    console.error("GET ESCROW ERROR ❌", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};