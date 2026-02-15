import mongoose from "mongoose";

const { Schema, model } = mongoose;

const escrowSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["held", "released", "refunded"],
      default: "held",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Escrow", escrowSchema);
