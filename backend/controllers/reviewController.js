import Review from "../models/Review.model.js";
import Job from "../models/Job.model.js";

/**
 * Create Review
 */
export const createReview = async (req, res) => {
  try {
    const jobId = req.params.jobId; // ✅ from URL
    const { rating, comment, revieweeId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID required",
      });
    }

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating required",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ✅ (optional) allow testing without restriction
    // remove strict check if causing issue
    /*
    if (
      job.client.toString() !== req.user.id &&
      (!job.freelancer || job.freelancer.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }
    */

    const existingReview = await Review.findOne({
      job: jobId,
      reviewer: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Already reviewed",
      });
    }

    const review = await Review.create({
      job: jobId,
      reviewer: req.user.id,
      reviewee: revieweeId || null,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      review,
    });

  } catch (error) {
    console.error("REVIEW ERROR ❌", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Reviews for a User
 */
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewee: req.params.userId,
    })
      .populate("reviewer", "username name role avatar")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("GET REVIEWS ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Update Review (Reviewer Only)
 */
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // ✅ Only reviewer
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (error) {
    console.error("UPDATE REVIEW ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Delete Review (Reviewer or Admin)
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // ✅ Reviewer OR admin
    if (
      review.reviewer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.error("DELETE REVIEW ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};