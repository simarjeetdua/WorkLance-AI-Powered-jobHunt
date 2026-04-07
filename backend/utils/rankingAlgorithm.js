import aiConfig from "../config/aiConfig.js";

/**
 * Calculate Score for a Job
 */
export const calculateJobScore = ({
  job,
  freelancerSkills,
}) => {
  const jobSkills = job.requiredSkills || [];

  // =============================
  // SKILL MATCH SCORE
  // =============================
  const matchedSkills = jobSkills.filter((skill) =>
    aiConfig.skillMatching.caseSensitive
      ? freelancerSkills.includes(skill)
      : freelancerSkills
          .map((s) => s.toLowerCase())
          .includes(skill.toLowerCase())
  );

  const skillScore =
    (matchedSkills.length / (jobSkills.length || 1)) *
    100 *
    aiConfig.weights.skillMatch;

  // =============================
  // BUDGET SCORE
  // =============================
  const budgetScore =
    (job.budget / aiConfig.budget.divisor) *
    aiConfig.weights.budget;

  // =============================
  // RECENCY SCORE
  // =============================
  const daysOld =
    (Date.now() - new Date(job.createdAt)) /
    (1000 * 60 * 60 * 24);

  const recencyScore =
    aiConfig.recencyScore(daysOld) *
    aiConfig.weights.recency;

  // =============================
  // FINAL SCORE
  // =============================
  const totalScore = skillScore + budgetScore + recencyScore;

  return {
    score: totalScore,
    matchedSkills,
  };
};

/**
 * Rank Jobs Based on Score
 */
export const rankJobs = (jobs, freelancerSkills) => {
  const scoredJobs = jobs.map((job) => {
    const { score, matchedSkills } = calculateJobScore({
      job,
      freelancerSkills,
    });

    return {
      job,
      score,
      matchedSkills,
    };
  });

  return scoredJobs.sort((a, b) => b.score - a.score);
};