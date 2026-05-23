import Profile from "../models/Profile.model.js";
import User from "../models/User.model.js";

/**
 * Create or Update Profile
 */
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { name, avatar, bio, skills, experienceLevel, hourlyRate, tagline, location, website, github, linkedin } = req.body;

    // Update User model fields if provided
    if (name !== undefined || avatar !== undefined) {
      const userUpdates = {};
      if (name !== undefined) userUpdates.name = name;
      if (avatar !== undefined) userUpdates.avatar = avatar;
      await User.findByIdAndUpdate(req.user.id, userUpdates);
    }

    // Find existing profile
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update profile
      profile.bio = bio !== undefined ? bio : profile.bio;
      profile.skills = skills !== undefined ? skills : profile.skills;
      profile.experienceLevel =
        experienceLevel !== undefined ? experienceLevel : profile.experienceLevel;
      profile.hourlyRate = hourlyRate !== undefined ? hourlyRate : profile.hourlyRate;
      profile.tagline = tagline !== undefined ? tagline : profile.tagline;
      profile.location = location !== undefined ? location : profile.location;
      profile.website = website !== undefined ? website : profile.website;
      profile.github = github !== undefined ? github : profile.github;
      profile.linkedin = linkedin !== undefined ? linkedin : profile.linkedin;

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
      bio: bio || "",
      skills: skills || [],
      experienceLevel: experienceLevel || "beginner",
      hourlyRate: hourlyRate || 0,
      tagline: tagline || "",
      location: location || "",
      website: website || "",
      github: github || "",
      linkedin: linkedin || "",
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
    }).populate("user", "username name email role avatar");

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
    }).populate("user", "username name role avatar");

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