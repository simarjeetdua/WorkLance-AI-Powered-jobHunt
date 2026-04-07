import User from "../models/User.model.js";
import Job from "../models/Job.model.js";

/**
 * Get all users (without password)
 */
export const getAllUsersService = async () => {
  return await User.find().select("-password");
};

/**
 * Delete user
 */
export const deleteUserService = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/**
 * Toggle user active/suspended
 */
export const toggleUserStatusService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};

/**
 * Get all jobs
 */
export const getAllJobsService = async () => {
  return await Job.find().populate("client", "name email");
};

/**
 * Delete job
 */
export const deleteJobService = async (jobId) => {
  const job = await Job.findByIdAndDelete(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  return job;
};