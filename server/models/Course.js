import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },  
  duration: { type: String },                  
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    price: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0 },
    enrollments: { type: Number, default: 0 },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: { type: String, default: "" },
    lessons: [lessonSchema],  
    zoomLink: { type: String },
    classroomLink: { type: String },
    zoomSchedule: [
      {
        title: String,
        start: Date,
        end: Date,
      }
    ],
    classroomSchedule: [
      {
        title: String,
        start: Date,
        end: Date,
      }
    ]

  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);