import Escrow from "../models/Escrow.model.js";
import Job from "../models/Job.model.js";
import Transaction from "../models/Transaction.model.js";
import paymentConfig from "../config/paymentConfig.js";

/**
 * Create Escrow
 */
export const createEscrowService = async ({
  jobId,
  clientId,
  freelancerId,
  amount,
}) => {
  // Check job
  const job = await Job.findById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  // Check ownership
  if (job.client.toString() !== clientId) {
    throw new Error("Not authorized to create escrow");
  }

  // Prevent duplicate escrow
  const existingEscrow = await Escrow.findOne({ job: jobId });

  if (existingEscrow) {
    throw new Error("Escrow already exists for this job");
  }

  // Validate amount
  if (
    amount < paymentConfig.limits.minAmount ||
    amount > paymentConfig.limits.maxAmount
  ) {
    throw new Error("Amount out of allowed range");
  }

  // Create escrow
  const escrow = await Escrow.create({
    job: jobId,
    client: clientId,
    freelancer: freelancerId,
    amount,
    status: "held",
  });

  return escrow;
};

/**
 * Release Payment
 */
export const releaseEscrowService = async ({
  escrowId,
  userId,
}) => {
  const escrow = await Escrow.findById(escrowId);

  if (!escrow) {
    throw new Error("Escrow not found");
  }

  // Only client can release
  if (escrow.client.toString() !== userId) {
    throw new Error("Not authorized to release payment");
  }

  if (escrow.status !== "held") {
    throw new Error("Escrow already processed");
  }

  // Calculate payout
  const payout = paymentConfig.calculateFreelancerPayout(
    escrow.amount
  );

  // Mock payment processing
  const paymentResult =
    await paymentConfig.gateway.processPayment(payout);

  // Update escrow
  escrow.status = "released";
  await escrow.save();

  // Create transaction
  const transaction = await Transaction.create({
    escrow: escrow._id,
    amount: payout,
    paymentMethod: "upi",
    status: paymentResult.status,
  });

  return { escrow, transaction };
};

/**
 * Refund Escrow
 */
export const refundEscrowService = async ({
  escrowId,
  userId,
  role,
}) => {
  const escrow = await Escrow.findById(escrowId);

  if (!escrow) {
    throw new Error("Escrow not found");
  }

  // Only client or admin
  if (
    escrow.client.toString() !== userId &&
    role !== "admin"
  ) {
    throw new Error("Not authorized to refund");
  }

  if (escrow.status !== "held") {
    throw new Error("Escrow already processed");
  }

  escrow.status = "refunded";
  await escrow.save();

  return escrow;
};

/**
 * Get Escrow by Job
 */
export const getEscrowByJobService = async (jobId) => {
  const escrow = await Escrow.findOne({ job: jobId })
    .populate("client", "name email")
    .populate("freelancer", "name email");

  if (!escrow) {
    throw new Error("Escrow not found");
  }

  return escrow;
};

/**
 * Get My Escrows
 */
export const getMyEscrowsService = async (userId) => {
  const escrows = await Escrow.find({
    $or: [{ client: userId }, { freelancer: userId }],
  })
    .populate("job", "title status")
    .sort({ createdAt: -1 });

  return escrows;
};