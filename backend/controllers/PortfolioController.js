import Portfolio from "../models/Portfolio.model.js";

/**
 * Create Portfolio Item
 */
export const createPortfolio = async (req, res) => {
  try {
    const { title, description, projectLink, image } = req.body;

    const portfolio = await Portfolio.create({
      user: req.user.id,
      title,
      description,
      projectLink,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Portfolio item created successfully",
      portfolio,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get My Portfolio
 */
export const getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portfolio.length,
      portfolio,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Portfolio by User ID (Public)
 */
export const getUserPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find({
      user: req.params.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portfolio.length,
      portfolio,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Portfolio Item
 */
export const updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Only owner can update
    if (portfolio.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { title, description, projectLink, image } = req.body;

    portfolio.title = title || portfolio.title;
    portfolio.description = description || portfolio.description;
    portfolio.projectLink = projectLink || portfolio.projectLink;
    portfolio.image = image || portfolio.image;

    await portfolio.save();

    res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Portfolio Item
 */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Only owner or admin
    if (
      portfolio.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await portfolio.deleteOne();

    res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};