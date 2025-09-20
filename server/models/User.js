import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },

    phone: String,
    dob: Date,
    avatarUrl: String,
    expertise: String,
    headline: String,
    bio: String,
    linkedin: String,
    website: String,
    experienceYears: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    courses: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);