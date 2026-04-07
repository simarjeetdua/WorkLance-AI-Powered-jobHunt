import mongoose from "mongoose";

const { Schema, model } = mongoose;

const analyticsSchema = new Schema(
  {
    // Total users on platform
    totalUsers: {
      type: Number,
      default: 0,
    },

    totalClients: {
      type: Number,
      default: 0,
    },

    totalFreelancers: {
      type: Number,
      default: 0,
    },

    // Job statistics
    totalJobs: {
      type: Number,
      default: 0,
    },

    openJobs: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },

    // Financial metrics
    totalRevenue: {
      type: Number,
      default: 0,
    },

    totalEscrowAmount: {
      type: Number,
      default: 0,
    },

    // Trending skills (for AI insights)
    trendingSkills: [
      {
        skill: {
          type: String,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Most active categories
    trendingCategories: [
      {
        category: {
          type: String,
        },
        jobCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Platform performance metrics
    dailyActiveUsers: {
      type: Number,
      default: 0,
    },

    monthlyActiveUsers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Analytics", analyticsSchema);
