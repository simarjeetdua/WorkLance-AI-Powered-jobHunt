import Profile from "../models/Profile.model.js";

/**
 * Create or Update Profile
 */
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { bio, skills, experienceLevel, hourlyRate } = req.body;

    // Find existing profile
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update profile
      profile.bio = bio || profile.bio;
      profile.skills = skills || profile.skills;
      profile.experienceLevel =
        experienceLevel || profile.experienceLevel;
      profile.hourlyRate = hourlyRate || profile.hourlyRate;

      await profile.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    }

    // Create new profile
    profile = await Profile.create({
      user: req.user.id,
      bio,
      skills,
      experienceLevel,
      hourlyRate,
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Logged-in User Profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", "name email role avatar");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Profile By User ID (Public)
 */
export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", "name role avatar");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Profile
 */
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};