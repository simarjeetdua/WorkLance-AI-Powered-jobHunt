import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// ==============================
// IMPORT ROUTES
// ==============================
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import escrowRoutes from "./routes/escrowRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

// ==============================
// IMPORT MIDDLEWARE
// ==============================
import { errorHandler } from "./middleware/errorMiddleware.js";

// ==============================
// CONFIG
// ==============================
dotenv.config();

const app = express();

// ==============================
// MIDDLEWARE
// ==============================
app.use(express.json());
app.use(cors());

// ==============================
// DATABASE CONNECTION
// ==============================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("DB Error ❌:", error.message);
    process.exit(1);
  }
};

connectDB();

// ==============================
// ROUTES
// ==============================
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recommendations", recommendationRoutes);

// ==============================
// HEALTH CHECK ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("WorkLance API is running 🚀");
});

// ==============================
// ERROR HANDLER (ALWAYS LAST)
// ==============================
app.use(errorHandler);

// ==============================
// SERVER START
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});