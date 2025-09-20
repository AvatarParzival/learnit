import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No token provided" });

    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireRole = (roles) => {
  if (typeof roles === "string") roles = [roles];
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    next();
  };
};