import Job from "../models/Job.model.js";

/**
 * Create Job (Client)
 */
export const createJob = async (req, res) => {
  try {
    console.log("CREATE JOB BODY 👉", req.body);

    const { title, description, requiredSkills, budget } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const job = await Job.create({
      client: req.user.id, // ✅ correct field
      title,
      description,
      requiredSkills,
      budget,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });

  } catch (error) {
    console.error("CREATE JOB ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Jobs (Search + Filter)
 */
export const getAllJobs = async (req, res) => {
  try {
    const { keyword, minBudget, maxBudget, skill } = req.query;

    let query = {};

    // Keyword search
    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    // Budget filter
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    // Skill filter
    if (skill) {
      query.requiredSkills = { $in: [skill] };
    }

    const jobs = await Job.find(query)
      .populate("client", "username name email role avatar") // ✅ FIXED
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {
    console.error("GET ALL JOBS ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Job
 */
export const getSingleJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("client", "username name email role avatar"); // ✅ FIXED

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });

  } catch (error) {
    console.error("GET SINGLE JOB ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Job (Owner Only)
 */
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Only owner can update
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { title, description, requiredSkills, budget, status } = req.body;

    job.title = title || job.title;
    job.description = description || job.description;
    job.requiredSkills = requiredSkills || job.requiredSkills;
    job.budget = budget || job.budget;
    job.status = status || job.status;

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });

  } catch (error) {
    console.error("UPDATE JOB ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Job (Owner or Admin)
 */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      job.client.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });

  } catch (error) {
    console.error("DELETE JOB ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get My Jobs (Client)
 */
export const getMyJobs = async (req, res) => {
  try {
    console.log("MY JOBS USER 👉", req.user);

    const jobs = await Job.find({
      client: req.user.id, // ✅ consistent
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {
    console.error("GET MY JOBS ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};