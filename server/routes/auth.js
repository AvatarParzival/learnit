import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "node:path";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const {
      role = "student",
      name,
      email,
      password,
      phone,
      dob,
      expertise,
      headline,
      bio,
      linkedin,
      website,
      inviteCode
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (role === "admin") {
      const required = process.env.ADMIN_INVITE_CODE;
      if (required && inviteCode !== required) {
        return res.status(403).json({ error: "Invalid admin invite code" });
      }
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const user = await User.create({
      role,
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      dob,
      avatarUrl,
      expertise,
      headline,
      bio,
      linkedin,
      website
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (e) {
    console.error("register error:", e);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    if (role && user.role !== role) {
      return res.status(403).json({ error: "Role mismatch for this account" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (e) {
    console.error("login error:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (e) {
    console.error("get profile error:", e);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, bio, expertise, experienceYears, headline, linkedin, website } = req.body;
    const userId = req.user.id;

    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (bio !== undefined) updateData.bio = bio;
    if (expertise !== undefined) updateData.expertise = expertise;

    if (experienceYears !== undefined) {
      updateData.experienceYears = Number(experienceYears);
    }
    if (headline !== undefined) updateData.headline = headline;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (website !== undefined) updateData.website = website;

    if (req.file) {
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    res.json(updatedUser);
  } catch (e) {
    console.error("update profile error:", e);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both old and new passwords are required" });
    }

    const user = await User.findById(req.user.id).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;