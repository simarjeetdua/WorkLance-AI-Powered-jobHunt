import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// ==============================
// GENERATE JWT TOKEN
// ==============================
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ==============================
// REGISTER USER
// ==============================
export const registerUser = async (req, res) => {
  try {
    console.log("REQ BODY 👉", req.body);

    const { username, name, email, password, role } = req.body;

    // Support both username & name
    const finalUsername = username || name;
    const finalName = name || username;

    // ✅ Validate input
    if (!finalUsername || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Role validation
    const allowedRoles = ["freelancer", "client"];
    const finalRole = allowedRoles.includes(role) ? role : "freelancer";

    // ✅ Check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // ✅ Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      username: finalUsername,
      name: finalName,
      email,
      password: hashedPass,
      role: finalRole,
    });

    // ✅ Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR ❌", error);

    // ✅ Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// LOGIN USER
// ==============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ✅ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET CURRENT USER
// ==============================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("GET USER ERROR ❌", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};