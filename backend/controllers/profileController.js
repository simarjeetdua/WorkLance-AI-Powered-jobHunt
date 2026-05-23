import Profile from "../models/Profile.model.js";
import User from "../models/User.model.js";
import Review from "../models/Review.model.js";
import Application from "../models/Application.model.js";

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
    let profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", "username name email role avatar");

    if (!profile) {
      // Automatically create an empty profile for the logged in user
      profile = await Profile.create({
        user: req.user.id,
        bio: "",
        skills: [],
        experienceLevel: "beginner",
        hourlyRate: 0,
        tagline: "",
        location: "",
        website: "",
        github: "",
        linkedin: "",
      });
      // Populate user fields
      profile = await Profile.findById(profile._id).populate("user", "username name email role avatar");
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

/**
 * Get Freelancers Marketplace (Public)
 */
export const getFreelancersMarketplace = async (req, res) => {
  try {
    const { search, skills, location, minRate, maxRate, experienceLevel, sortBy, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Build the match stage for Profile
    const profileMatch = {};

    if (skills) {
      const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArr.length > 0) {
        profileMatch.skills = { $in: skillsArr };
      }
    }

    if (location) {
      profileMatch.location = { $regex: location, $options: 'i' };
    }

    if (minRate || maxRate) {
      profileMatch.hourlyRate = {};
      if (minRate) profileMatch.hourlyRate.$gte = Number(minRate);
      if (maxRate) profileMatch.hourlyRate.$lte = Number(maxRate);
    }

    if (experienceLevel && experienceLevel !== 'all') {
      profileMatch.experienceLevel = experienceLevel;
    }

    // Build the user match stage (role: freelancer, and search query)
    const userMatch = { "userDoc.role": "freelancer" };
    if (search) {
      userMatch.$or = [
        { "userDoc.name": { $regex: search, $options: "i" } },
        { "userDoc.username": { $regex: search, $options: "i" } }
      ];
    }

    // Aggregation pipeline to fetch, calculate ratings, sort and paginate
    const pipeline = [
      // 1. Filter Profiles by base filters first
      { $match: profileMatch },
      // 2. Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDoc"
        }
      },
      { $unwind: "$userDoc" },
      // 3. Filter by User details (role: freelancer, and search name)
      { $match: userMatch },
      // 4. Lookup reviews stats
      {
        $lookup: {
          from: "reviews",
          localField: "user",
          foreignField: "reviewee",
          as: "reviews"
        }
      },
      // 5. Lookup completed jobs (applications with status 'accepted')
      {
        $lookup: {
          from: "applications",
          let: { freelancerId: "$user" },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ["$freelancer", "$$freelancerId"] }, { $eq: ["$status", "accepted"] } ] } } }
          ],
          as: "acceptedApps"
        }
      },
      // 6. Project necessary fields and calculate avgRating & reviewsCount & completedJobs
      {
        $project: {
          user: {
            _id: "$userDoc._id",
            username: "$userDoc.username",
            name: "$userDoc.name",
            email: "$userDoc.email",
            role: "$userDoc.role",
            avatar: "$userDoc.avatar",
            isActive: "$userDoc.isActive"
          },
          bio: 1,
          skills: 1,
          experienceLevel: 1,
          hourlyRate: 1,
          tagline: 1,
          location: 1,
          website: 1,
          github: 1,
          linkedin: 1,
          createdAt: 1,
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $round: [{ $avg: "$reviews.rating" }, 1] },
              else: 0
            }
          },
          reviewsCount: { $size: "$reviews" },
          completedJobs: { $size: "$acceptedApps" }
        }
      }
    ];

    // Calculate total matching records first (before skip and limit)
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Profile.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Apply Sorting
    let sortStage = {};
    if (sortBy === 'lowest_rate') {
      sortStage = { hourlyRate: 1 };
    } else if (sortBy === 'highest_rate') {
      sortStage = { hourlyRate: -1 };
    } else if (sortBy === 'highest_rated') {
      sortStage = { avgRating: -1, reviewsCount: -1 };
    } else {
      sortStage = { createdAt: -1 }; // newest
    }
    pipeline.push({ $sort: sortStage });

    // Apply Pagination
    pipeline.push({ $skip: (pageNum - 1) * limitNum });
    pipeline.push({ $limit: limitNum });

    // Execute aggregation
    const freelancers = await Profile.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: freelancers.length,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      totalCount,
      freelancers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};