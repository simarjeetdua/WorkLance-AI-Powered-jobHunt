import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";

/**
 * ✅ Apply for Job (Freelancer)
 */
export const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // ✅ SAFE BODY (prevents crash)
    const proposal = req.body?.proposal || "";
    const bidAmount = req.body?.bidAmount || 0;

    console.log("🔥 APPLY HIT");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!proposal) {
      return res.status(400).json({
        success: false,
        message: "Proposal is required",
      });
    }

    // ✅ Check job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ✅ Prevent duplicate
    const alreadyApplied = await Application.findOne({
      job: jobId,
      freelancer: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You already applied to this job",
      });
    }

    // ✅ Create application
    const application = await Application.create({
      job: jobId,
      freelancer: req.user.id,
      proposal,
      bidAmount,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });

  } catch (error) {
    console.error("❌ APPLY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Get Applications for a Specific Job (Client)
 */
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId })
      .populate("freelancer", "username email role")
      .populate("job", "title budget")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error("❌ GET JOB APPS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Get ALL Applications for Client's Jobs
 */
export const getClientApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "job",
        match: { client: req.user.id }, // only client jobs
        select: "title budget client",
      })
      .populate("freelancer", "username email role")
      .sort({ createdAt: -1 });

    // remove null jobs
    const filtered = applications.filter(app => app.job !== null);

    res.status(200).json({
      success: true,
      count: filtered.length,
      applications: filtered,
    });

  } catch (error) {
    console.error("❌ CLIENT APPS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Get My Applications (Freelancer)
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      freelancer: req.user.id,
    })
      .populate("job", "title budget status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error("❌ MY APPS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Update Application Status (Client/Admin)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const application = await Application.findById(req.params.id)
      .populate("job");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // ✅ Only client OR admin
    if (
      application.job.client.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application ${status}`,
      application,
    });

  } catch (error) {
    console.error("❌ UPDATE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};