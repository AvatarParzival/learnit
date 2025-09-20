import express from "express";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import multer from "multer";
import path from "node:path";

const populateInstructorWithCounts = async (courses) => {
  return Promise.all(
    courses.map(async (course) => {
      if (course.instructor && typeof course.instructor === 'object') {

        const courseCount = await Course.countDocuments({ 
          instructor: course.instructor._id 
        });

        const instructorCourses = await Course.find({ 
          instructor: course.instructor._id 
        }).select("_id");
        
        const courseIds = instructorCourses.map(c => c._id);
        const uniqueStudents = await Enrollment.distinct("studentId", {
          courseId: { $in: courseIds }
        });

        return {
          ...course.toObject(),
          instructor: {
            ...course.instructor.toObject(),
            courses: courseCount,
            students: uniqueStudents.length
          }
        };
      }
      return course;
    })
  );
};

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(process.cwd(), "uploads/courses")),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.get("/:id/learn", requireAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name avatarUrl bio");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      rating: course.rating,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      zoomLink: course.zoomLink,
      zoomSchedule: course.zoomSchedule || [],
      classroomLink: course.classroomLink,
      classroomSchedule: course.classroomSchedule || [],
    });
  } catch (err) {
    console.error("Error loading course:", err);
    res.status(500).json({ error: "Failed to load course" });
  }
});

router.get("/enrolled/my-courses", requireAuth, async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: "courseId",
        select: "title instructor category thumbnail price rating enrollments",
        populate: {
          path: "instructor",
          select: "name avatarUrl"
        }
      })
      .sort({ enrolledAt: -1 });

const enrolledCourses = enrollments
  .filter(e => e.courseId)
  .map(e => ({
    _id: e.courseId._id,
    title: e.courseId.title,
    instructor: e.courseId.instructor.name,
    category: e.courseId.category,
    thumbnail: e.courseId.thumbnail,
    price: e.courseId.price,
    rating: e.courseId.rating,
    totalStudents: e.courseId.enrollments,
    enrolledAt: e.enrolledAt,
    progress: Math.floor(Math.random() * 100),
    lastAccessed: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalLessons: Math.floor(Math.random() * 20) + 10,
    completedLessons: Math.floor(Math.random() * 15) + 1,
  }));

res.json(enrolledCourses);
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ error: "Failed to fetch enrolled courses" });
  }
});

router.get("/enrolled/check/:courseId", requireAuth, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId
    });

    res.json({ isEnrolled: !!enrollment });
  } catch (err) {
    console.error("Error checking enrollment:", err);
    res.status(500).json({ error: "Failed to check enrollment" });
  }
});

router.get("/recommended", requireAuth, async (req, res) => {
  try {
    const studentId = req.user._id;
    const enrolledCourses = await Enrollment.find({ studentId }).distinct("courseId");
    const recommendedCourses = await Course.find({
      _id: { $nin: enrolledCourses }
    })
    .populate("instructor", "name avatarUrl")
    .sort({ enrollments: -1, rating: -1 })
    .limit(6);

    res.json(recommendedCourses);
  } catch (err) {
    console.error("Error fetching recommended courses:", err);
    res.status(500).json({ error: "Failed to fetch recommended courses" });
  }
});

router.post("/:id/enroll", requireAuth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user._id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId
    });

    if (existingEnrollment) {
      return res.status(409).json({ error: "Already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      amount: course.price
    });

    course.enrollments += 1;
    await course.save();
    await enrollment.populate("courseId", "title instructor category thumbnail");

    res.status(201).json({
      message: "Successfully enrolled in course",
      enrollment
    });
  } catch (err) {
    console.error("Error enrolling in course:", err);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
});

router.delete("/:id/unenroll", requireAuth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user._id;
    const enrollment = await Enrollment.findOneAndDelete({
      studentId,
      courseId
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Not enrolled in this course" });
    }

    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollments: -1 }
    });

    res.json({ message: "Successfully unenrolled from course" });
  } catch (err) {
    console.error("Error unenrolling from course:", err);
    res.status(500).json({ error: "Failed to unenroll from course" });
  }
});

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 12,
      q,
      category,
      level,
      sort = "newest",
      instructorId,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const filter = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (instructorId) {
      filter.instructor = instructorId;
    }

    let query = Course.find(filter)
      .populate("instructor", "name avatarUrl")
      .skip(skip)
      .limit(parseInt(pageSize));

    if (sort === "rating") query = query.sort({ rating: -1 });
    else if (sort === "popular") query = query.sort({ enrollments: -1 });
    else if (sort === "price-asc") query = query.sort({ price: 1 });
    else if (sort === "price-desc") query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 }); 
    const [data, total] = await Promise.all([
      query.exec(),
      Course.countDocuments(filter),
    ]);

    const coursesWithInstructorCounts = await populateInstructorWithCounts(data);

    res.json({
      data: coursesWithInstructorCounts,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.post("/", requireAuth, requireRole(["admin", "instructor"]), upload.single("thumbnail"), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      price,
      zoomLink, 
      classroomLink
    } = req.body;

    if (!title || !description || !category || !level || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const thumbnail = req.file ? `/uploads/courses/${req.file.filename}` : "";
      let zoomSchedule = [];
      let classroomSchedule = [];

      if (req.body.zoomSchedule) {
        zoomSchedule =
          typeof req.body.zoomSchedule === "string"
            ? JSON.parse(req.body.zoomSchedule)
            : req.body.zoomSchedule;
      }

      if (req.body.classroomSchedule) {
        classroomSchedule =
          typeof req.body.classroomSchedule === "string"
            ? JSON.parse(req.body.classroomSchedule)
            : req.body.classroomSchedule;
      }
      const course = await Course.create({
        title,
        description,
        category,
        level,
        price: parseFloat(price),
        thumbnail,
        instructor: req.user._id,
        zoomLink: req.body.zoomLink || "",
        classroomLink: req.body.classroomLink || "",
        zoomSchedule: req.body.zoomSchedule
          ? JSON.parse(req.body.zoomSchedule)
          : [],
        classroomSchedule: req.body.classroomSchedule
          ? JSON.parse(req.body.classroomSchedule)
          : []
      });
    await course.populate("instructor", "name avatarUrl bio");

    res.status(201).json(course);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name avatarUrl bio expertise"
    );
    if (!course) return res.status(404).json({ error: "Course not found" });
    const courseWithInstructorCounts = await populateInstructorWithCounts([course]);

    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

router.put("/:id", requireAuth, requireRole(["admin", "instructor"]), upload.single("thumbnail"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.user.role !== "admin" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this course" });
    }

    const {
      title,
      description,
      category,
      level,
      price,
      zoomLink, 
      classroomLink
    } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (level) course.level = level;
    if (price) course.price = parseFloat(price);
    if (zoomLink !== undefined) course.zoomLink = zoomLink;
    if (classroomLink !== undefined) course.classroomLink = classroomLink;
    if (req.file) {
      course.thumbnail = `/uploads/courses/${req.file.filename}`;
    }

    if (req.body.zoomLink !== undefined) course.zoomLink = req.body.zoomLink;
    if (req.body.classroomLink !== undefined) course.classroomLink = req.body.classroomLink;

    if (req.body.zoomSchedule) {
      course.zoomSchedule = typeof req.body.zoomSchedule === "string"
        ? JSON.parse(req.body.zoomSchedule)
        : req.body.zoomSchedule;
    }
    if (req.body.classroomSchedule) {
      course.classroomSchedule = typeof req.body.classroomSchedule === "string"
        ? JSON.parse(req.body.classroomSchedule)
        : req.body.classroomSchedule;
    }


    await course.save();

    await course.populate("instructor", "name avatarUrl bio");

    res.json(course);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Failed to update course" });
  }
});

router.delete("/:id", requireAuth, requireRole(["admin", "instructor"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.user.role !== "admin" && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this course" });
    }
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

export default router;