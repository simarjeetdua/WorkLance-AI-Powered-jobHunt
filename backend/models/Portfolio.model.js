import mongoose from "mongoose";

const { Schema, model } = mongoose;

const portfolioSchema = new Schema(
  {
    // Reference to the freelancer (User)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Project title
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },

    // Short description of the project
    description: {
      type: String,
      required: [true, "Project description is required"],
    },

    // Technologies or skills used
    skillsUsed: [
      {
        type: String,
        trim: true,
      },
    ],

    // Project URL (Live link)
    projectLink: {
      type: String,
      default: "",
    },

    // GitHub repository link
    githubLink: {
      type: String,
      default: "",
    },

    // Images related to project
    images: [
      {
        type: String,
      },
    ],

    // Whether project is featured
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Portfolio", portfolioSchema);
