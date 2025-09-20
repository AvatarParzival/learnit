import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, q, expertise, sort = "rating" } = req.query;

    const filter = { role: "instructor" };
    if (q) filter.name = { $regex: q, $options: "i" };
    if (expertise) filter.expertise = expertise;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const instructors = await User.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort === "rating" ? { rating: -1 } : { createdAt: -1 })
      .select("-passwordHash");

    const instructorsWithCounts = await Promise.all(
      instructors.map(async (instructor) => {
        const courseCount = await Course.countDocuments({ 
          instructor: instructor._id 
        });

        const instructorCourses = await Course.find({ 
          instructor: instructor._id 
        }).select("_id");
        
        const courseIds = instructorCourses.map(course => course._id);
        const uniqueStudents = await Enrollment.distinct("studentId", {
          courseId: { $in: courseIds }
        });

        return {
          ...instructor.toObject(),
          courses: courseCount,
          students: uniqueStudents.length
        };
      })
    );

    const total = await User.countDocuments(filter);

    res.json({ 
      data: instructorsWithCounts, 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (err) {
    console.error("Error fetching instructors:", err);
    res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

router.get("/dashboard/stats", requireAuth, requireRole("instructor"), async (req, res) => {
  try {
    const instructorId = req.user._id;
    const totalCourses = await Course.countDocuments({ instructor: instructorId });
    const instructorCourses = await Course.find({ instructor: instructorId }).distinct("_id");
    const enrollments = await Enrollment.find({ courseId: { $in: instructorCourses } });
    const totalStudents = new Set(enrollments.map(e => e.studentId.toString())).size;
    const averageRatingAgg = await Course.aggregate([
      { $match: { instructor: instructorId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const averageRating = averageRatingAgg[0]?.avgRating || 0;

    res.json({
      totalCourses,
      totalStudents,
      averageRating,
      totalReviews: enrollments.length,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/courses", requireAuth, requireRole("instructor"), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
    res.status(500).json({ error: "Failed to fetch instructor courses" });
  }
});

router.get("/enrollments/recent", requireAuth, requireRole("instructor"), async (req, res) => {
  try {
    const instructorCourses = await Course.find({ instructor: req.user._id }).distinct("_id");

    const enrollments = await Enrollment.find({ courseId: { $in: instructorCourses } })
      .populate("studentId", "name email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(enrollments.map(e => ({
      student: e.studentId?.name || "Unknown",
      course: e.courseId?.title || "Unknown",
      date: e.createdAt,
      amount: e.amount || 0,
    })));
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const instructor = await User.findOne({ _id: req.params.id, role: "instructor" }).select("-passwordHash");
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    res.json(instructor);
  } catch (err) {
    console.error("Error fetching instructor by id:", err);
    res.status(500).json({ error: "Server error" });
  }
});
export default router;