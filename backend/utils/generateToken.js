import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                 // payload
    process.env.JWT_SECRET,         // secret key
    { expiresIn: "7d" }             // expiry
  );
};

export default generateToken;