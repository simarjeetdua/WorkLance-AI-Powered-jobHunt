import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import { createNotification } from "./notificationController.js";

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
      .populate("freelancer", "username name email role avatar")
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
    const clientJobs = await Job.find({ client: req.user.id }).select("_id");
    const jobIds = clientJobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title budget client")
      .populate("freelancer", "username name email role avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
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

    if (!req.params.id || !/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing application ID format",
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

    // Trigger Notification for the freelancer
    let title = "Application Update 📄";
    let message = `Your application status for "${application.job.title}" has been updated to: ${status}.`;
    let priority = "medium";

    if (status === "viewed") {
      message = `Your application for "${application.job.title}" was viewed by the client.`;
    } else if (status === "shortlisted") {
      title = "Shortlisted! ⭐";
      message = `Great news! You have been shortlisted for "${application.job.title}".`;
      priority = "high";
    } else if (status === "interview") {
      title = "Interview Requested 🗓️";
      message = `The client has requested an interview for "${application.job.title}". Check your messages!`;
      priority = "high";
    } else if (status === "accepted") {
      title = "Application Accepted 🎉";
      message = `Congratulations! Your application for "${application.job.title}" has been accepted.`;
      priority = "high";
    } else if (status === "rejected") {
      message = `Your application for "${application.job.title}" was not selected this time. Keep trying!`;
    } else if (status === "hired") {
      title = "Hired! 🚀";
      message = `You have been hired for "${application.job.title}"! Check the escrow section to confirm details.`;
      priority = "high";
    }

    await createNotification({
      recipient: application.freelancer,
      sender: req.user.id,
      type: "application",
      priority,
      title,
      message,
      link: "/dashboard/applications",
    });

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

/**
 * 💼 Client initiates hiring proposal (creates a Job and an Application)
 */
export const hireProposeFreelancer = async (req, res) => {
  try {
    const { freelancerId, projectTitle, description, bidAmount } = req.body;

    if (!freelancerId || !projectTitle || !description || !bidAmount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required to send proposal",
      });
    }

    // 1. Create a job automatically
    const job = await Job.create({
      title: projectTitle,
      description,
      budget: Number(bidAmount),
      client: req.user.id,
      status: "open",
      category: "Development",
      skills: ["Development"],
      requiredSkills: ["Development"],
      experienceLevel: "intermediate",
    });

    // 2. Create the application linking the freelancer to this job
    const application = await Application.create({
      job: job._id,
      freelancer: freelancerId,
      proposal: description,
      bidAmount: Number(bidAmount),
      status: "pending",
    });

    // 3. Create a notification for the freelancer
    await createNotification({
      recipient: freelancerId,
      sender: req.user.id,
      type: "application",
      priority: "high",
      title: "New Job Proposal Received! 📩",
      message: `${req.user.name || req.user.username} has invited you to work on "${projectTitle}" for $${bidAmount}.`,
      link: "/dashboard/applications",
    });

    res.status(201).json({
      success: true,
      message: "Hiring proposal sent successfully!",
      job,
      application,
    });
  } catch (error) {
    console.error("❌ HIRE PROPOSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};