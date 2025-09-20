import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  platformName: { type: String, default: "StudentHub" },
  maintenanceMode: { type: Boolean, default: false },
  smtpHost: { type: String, default: "" },
  smtpPort: { type: String, default: "" },
  emailFrom: { type: String, default: "" },
  notifications: { type: Boolean, default: true },
  theme: { type: String, enum: ["light", "dark"], default: "light" },

  social: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" }
  },

  subscribers: [
    {
      email: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });
export default mongoose.model("Setting", settingSchema);