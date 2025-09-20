import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  amount: { type: Number, required: true },
  enrolledAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Enrollment", enrollmentSchema);
