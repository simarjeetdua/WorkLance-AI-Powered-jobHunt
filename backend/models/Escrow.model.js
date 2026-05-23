import mongoose from "mongoose";

const { Schema, model } = mongoose;

const escrowSchema = new Schema(
  {
    // 🔗 Link to job
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    // 🔗 Link to application (VERY IMPORTANT)
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true, // ✅ prevents duplicate escrow
    },

    // 👤 Client (payer)
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👤 Freelancer (receiver)
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 💰 Amount
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // 📊 Status (detailed escrow states)
    status: {
      type: String,
      enum: [
        "payment_pending",
        "held_in_escrow",
        "funded", // backwards compatibility
        "work_submitted",
        "client_review_pending",
        "released",
        "refunded",
        "disputed"
      ],
      default: "payment_pending",
    },

    // 🧾 Optional note
    note: {
      type: String,
      default: "",
    },

    // 📂 Work Submission Info
    workNotes: {
      type: String,
      default: "",
    },
    workAttachment: {
      type: String,
      default: "",
    },
    submittedAt: {
      type: Date,
    },

    // ⚠️ Dispute details
    disputeReason: {
      type: String,
      default: "",
    },
    disputedAt: {
      type: Date,
    },

    // 🕒 Payment timestamps
    fundedAt: {
      type: Date,
      default: Date.now,
    },

    releasedAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🚀 Index for fast queries
escrowSchema.index({ client: 1, freelancer: 1 });

export default model("Escrow", escrowSchema);