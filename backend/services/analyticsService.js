import User from "../models/User.model.js";
import Job from "../models/Job.model.js";
import Escrow from "../models/Escrow.model.js";
import Transaction from "../models/Transaction.model.js";
import Review from "../models/Review.model.js";

/**
 * Get Full Platform Analytics
 */
export const getPlatformAnalyticsService = async () => {
  // =============================
  // USER ANALYTICS
  // =============================
  const totalUsers = await User.countDocuments();
  const totalClients = await User.countDocuments({ role: "client" });
  const totalFreelancers = await User.countDocuments({ role: "freelancer" });
  const activeUsers = await User.countDocuments({ isActive: true });

  // =============================
  // JOB ANALYTICS
  // =============================
  const totalJobs = await Job.countDocuments();
  const openJobs = await Job.countDocuments({ status: "open" });
  const completedJobs = await Job.countDocuments({ status: "completed" });

  // =============================
  // FINANCIAL ANALYTICS
  // =============================
  const escrowAgg = await Escrow.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const revenueAgg = await Transaction.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // =============================
  // REVIEW ANALYTICS
  // =============================
  const reviewAgg = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  // =============================
  // TRENDING SKILLS
  // =============================
  const trendingSkills = await Job.aggregate([
    { $unwind: "$requiredSkills" },
    {
      $group: {
        _id: "$requiredSkills",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // =============================
  // FINAL STRUCTURED RESPONSE
  // =============================
  return {
    users: {
      totalUsers,
      totalClients,
      totalFreelancers,
      activeUsers,
    },
    jobs: {
      totalJobs,
      openJobs,
      completedJobs,
    },
    finance: {
      totalEscrowAmount: escrowAgg[0]?.total || 0,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
    reviews: {
      averageRating: reviewAgg[0]?.avgRating?.toFixed(2) || 0,
    },
    trendingSkills,
  };
};