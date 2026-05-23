import mongoose from "mongoose";

const { Schema, model } = mongoose;

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposal: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "applied",
        "viewed",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
        "hired"
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Application", applicationSchema);
