import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    escrow: {
      type: Schema.Types.ObjectId,
      ref: "Escrow",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking"],
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Transaction", transactionSchema);
