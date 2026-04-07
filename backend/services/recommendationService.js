import Job from "../models/Job.model.js";
import Profile from "../models/Profile.model.js";
import aiConfig from "../config/aiConfig.js";

/**
 * Get Job Recommendations for Freelancer
 */
export const getRecommendationsService = async (userId) => {
  // =============================
  // GET USER PROFILE
  // =============================
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const freelancerSkills = profile.skills || [];

  // =============================
  // GET OPEN JOBS
  // =============================
  const jobs = await Job.find({ status: "open" });

  // =============================
  // SCORE EACH JOB
  // =============================
  const scoredJobs = jobs.map((job) => {
    const jobSkills = job.requiredSkills || [];

    // -----------------------------
    // SKILL MATCH SCORE
    // -----------------------------
    const matchedSkills = jobSkills.filter((skill) =>
      aiConfig.skillMatching.caseSensitive
        ? freelancerSkills.includes(skill)
        : freelancerSkills.map(s => s.toLowerCase())
            .includes(skill.toLowerCase())
    );

    const skillScore =
      (matchedSkills.length / (jobSkills.length || 1)) *
      100 *
      aiConfig.weights.skillMatch;

    // -----------------------------
    // BUDGET SCORE
    // -----------------------------
    const budgetScore =
      (job.budget / aiConfig.budget.divisor) *
      aiConfig.weights.budget;

    // -----------------------------
    // RECENCY SCORE
    // -----------------------------
    const daysOld =
      (Date.now() - new Date(job.createdAt)) /
      (1000 * 60 * 60 * 24);

    const recencyScore =
      aiConfig.recencyScore(daysOld) *
      aiConfig.weights.recency;

    // -----------------------------
    // FINAL SCORE
    // -----------------------------
    const totalScore = skillScore + budgetScore + recencyScore;

    return {
      job,
      score: totalScore,
      matchedSkills,
    };
  });

  // =============================
  // SORT + LIMIT RESULTS
  // =============================
  const recommendations = scoredJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, aiConfig.recommendation.maxResults);

  return recommendations;
};