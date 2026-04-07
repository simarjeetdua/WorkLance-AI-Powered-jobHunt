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

    // 📊 Status (FIXED naming)
    status: {
      type: String,
      enum: ["funded", "released", "refunded"],
      default: "funded",
    },

    // 🧾 Optional note
    note: {
      type: String,
      default: "",
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