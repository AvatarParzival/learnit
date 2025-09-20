import coursesRoutes from "./routes/courses.js";
import instructorsRoutes from "./routes/instructors.js";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import Settings from "./models/Setting.js";

const app = express();
dotenv.config();
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.set("trust proxy", 1);
app.use("/api/admin", adminRouter);
app.use("/api/instructors", instructorsRoutes);
app.use("/api/courses", coursesRoutes);

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const coursesUploadsDir = path.join(process.cwd(), "uploads/courses");
if (!fs.existsSync(coursesUploadsDir)) fs.mkdirSync(coursesUploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use(generalLimiter);
app.use("/auth", authLimiter, authRoutes);
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (settings.subscribers.some((s) => s.email === email)) {
      return res.status(409).json({ error: "Already subscribed" });
    }

    settings.subscribers.push({ email });
    await settings.save();

    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/social", async (_req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings?.social || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch social links" });
  }
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, _next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studenthub";

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGO_URI, { dbName: "studenthub" })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Mongo connection error:", e.message);
    process.exit(1);
  });