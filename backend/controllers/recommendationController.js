import Job from "../models/Job.model.js";
import Profile from "../models/Profile.model.js";

/**
 * Get AI Job Recommendations (Freelancer)
 */
export const getJobRecommendations = async (req, res) => {
  try {
    // Get freelancer profile
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const freelancerSkills = profile.skills || [];

    // Get all open jobs
    const jobs = await Job.find({ status: "open" }).populate("client", "username name email role avatar");

    // Calculate score for each job
    const scoredJobs = jobs.map((job) => {
      const jobSkills = job.requiredSkills || [];

      // Skill match count
      const matchedSkills = jobSkills.filter((skill) =>
        freelancerSkills.includes(skill)
      );

      const skillScore =
        (matchedSkills.length / (jobSkills.length || 1)) * 100;

      // Budget score (normalize)
      const budgetScore = job.budget / 1000; // simple scaling

      // Recency score (new jobs preferred)
      const daysOld =
        (Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);

      const recencyScore = daysOld < 3 ? 20 : daysOld < 7 ? 10 : 5;

      // Final score
      const totalScore = skillScore + budgetScore + recencyScore;

      return {
        job,
        score: totalScore,
      };
    });

    // Sort jobs by score (descending)
    const recommendedJobs = scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // top 10 jobs

    res.status(200).json({
      success: true,
      count: recommendedJobs.length,
      recommendations: recommendedJobs,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};