import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Setting from "../models/Setting.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", requireAuth, requireRole("admin"), async (_req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalInstructors = await User.countDocuments({ role: "instructor" });

  const revenueAgg = await Enrollment.aggregate([
    { $match: { status: "paid" } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $group: { _id: null, total: { $sum: "$course.price" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total ?? 0;

  const recentSignups = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  res.json({
    totalUsers,
    totalCourses,
    totalInstructors,
    totalRevenue,
    recentSignups
  });
});

router.get("/users", requireAuth, requireRole("admin"), async (_req, res) => {
  const users = await User.find().select("-password").lean();
  res.json(users);
});

router.get("/courses", requireAuth, requireRole("admin"), async (_req, res) => {
  const courses = await Course.find()
    .populate("instructor", "name email avatarUrl")
    .lean();
  res.json(courses);
});

router.get("/revenue", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const result = await Enrollment.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);

    res.json({ totalRevenue: result[0]?.totalRevenue || 0 });
  } catch (err) {
    console.error("Error fetching revenue:", err);
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

router.get("/user-growth", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const growth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formatted = growth.map((g) => ({
      month: months[g._id - 1],
      count: g.count
    }));

    res.json({ monthlyUsers: formatted });
  } catch (err) {
    console.error("Error fetching user growth:", err);
    res.status(500).json({ error: "Failed to fetch user growth" });
  }
});

router.get("/revenue/monthly", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const revenue = await Enrollment.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formatted = revenue.map((r) => ({
      month: months[r._id - 1],
      amount: r.total
    }));

    const totalRevenue = formatted.reduce((sum, r) => sum + r.amount, 0);

    res.json({ monthlyRevenue: formatted, totalRevenue });
  } catch (err) {
    console.error("Error fetching monthly revenue:", err);
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

router.get("/activity", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const users = await User.find().sort({ createdAt: -1 }).limit(20).select("name createdAt");
    const courses = await Course.find().sort({ createdAt: -1 }).limit(20).select("title createdAt");
    const enrollments = await Enrollment.find().sort({ createdAt: -1 }).limit(20).populate("courseId studentId");

    const activity = [
      ...users.map(u => ({ action: "User registered", user: u.name, time: u.createdAt })),
      ...courses.map(c => ({ action: "New course published", user: "System", time: c.createdAt })),
      ...enrollments.map(e => ({
        action: "New enrollment",
        user: e.studentId?.name ?? "Unknown",
        time: e.createdAt,
        course: e.courseId?.title
      }))
    ];

    activity.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(activity.slice(0, limit));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.put("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

import { Parser } from "json2csv";

router.get("/reports/users", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const users = await User.find().select("name email role createdAt").lean();

    const fields = ["name", "email", "role", "createdAt"];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(users);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users-report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
});

router.get("/reports/revenue", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: "paid" })
      .populate("courseId", "title price")
      .lean();

    const data = enrollments.map(e => ({
      course: e.courseId?.title || "Unknown",
      price: e.courseId?.price || 0,
      student: e.studentId?.name || "Unknown",
      date: e.createdAt,
    }));

    const fields = ["course", "price", "student", "date"];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=revenue-report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
});

router.get("/reports/courses", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("courseId", "title price")
      .populate("studentId", "name")
      .lean();

    const courseMap = {};
    enrollments.forEach(e => {
      if (!courseMap[e.courseId?._id]) {
        courseMap[e.courseId?._id] = {
          course: e.courseId?.title || "Unknown",
          price: e.courseId?.price || 0,
          totalEnrollments: 0,
          totalRevenue: 0,
        };
      }
      courseMap[e.courseId?._id].totalEnrollments += 1;
      courseMap[e.courseId?._id].totalRevenue += e.amount || e.courseId?.price || 0;
    });

    const data = Object.values(courseMap);

    const { Parser } = await import("json2csv");
    const parser = new Parser({ fields: ["course", "price", "totalEnrollments", "totalRevenue"] });
    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=courses-report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Course Performance CSV" });
  }
});

router.get("/monthly-active", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const newUsers = await User.distinct("_id", {
      createdAt: { $gte: since }
    });

    const enrolledUsers = await Enrollment.distinct("studentId", {
      createdAt: { $gte: since }
    });

    const activeUserIds = new Set([...newUsers, ...enrolledUsers]);

    res.json({ monthlyActive: activeUserIds.size });
  } catch (err) {
    console.error("Error fetching MAU:", err);
    res.status(500).json({ error: "Failed to fetch monthly active users" });
  }
});

router.get("/settings", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to load settings" });
  }
});

router.get("/public-settings", async (_req, res) => {
  try {
    let settings = await Setting.findOne().select("platformName social theme");
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error("Public settings error:", err);
    res.status(500).json({ error: "Failed to load public settings" });
  }
});

router.put("/settings", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error("Save settings error:", err);
    res.status(500).json({ message: "Failed to save settings" });
  }
});

router.put("/social", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    settings.social = { ...settings.social, ...req.body };
    await settings.save();

    res.json(settings.social);
  } catch (err) {
    res.status(500).json({ error: "Failed to update social links" });
  }
});

router.get("/subscribers", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const settings = await Setting.findOne();
    res.json(settings?.subscribers || []);
  } catch (err) {
    console.error("Fetch subscribers error:", err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    if (settings.subscribers.some((s) => s.email === email.toLowerCase())) {
      return res.status(409).json({ error: "Already subscribed" });
    }

    settings.subscribers.push({ email: email.toLowerCase() });
    await settings.save();

    res.json({ message: "Subscribed successfully" });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

router.delete("/subscribers/:email", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { email } = req.params;
    const settings = await Setting.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    settings.subscribers = settings.subscribers.filter((s) => s.email !== email.toLowerCase());
    await settings.save();

    res.json({ message: "Subscriber deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
});

export default router;