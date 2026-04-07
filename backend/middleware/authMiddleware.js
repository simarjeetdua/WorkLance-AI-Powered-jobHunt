import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

/**
 * Protect Middleware (Authentication)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is suspended",
      });
    }

    // ✅ FIX: Attach both id + _id
    req.user = {
      ...user._doc,
      id: user._id.toString(), // 🔥 IMPORTANT FIX
    };

    next();

  } catch (error) {
    console.error("AUTH ERROR ❌", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};