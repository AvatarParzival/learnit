import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function InstructorProfile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    expertise: "",
    avatarUrl: "",
    experienceYears: "",
    headline: "",
    linkedin: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(response.data);
      if (response.data.avatarUrl) {
        setAvatarPreview(response.data.avatarUrl);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("bio", userData.bio || "");
      formData.append("expertise", userData.expertise || "");
      formData.append("experienceYears", userData.experienceYears || "");
      formData.append("headline", userData.headline || "");
      formData.append("linkedin", userData.linkedin || "");
      formData.append("website", userData.website || "");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await axios.put("/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      if (response.data.avatarUrl) {
        localStorage.setItem("avatarUrl", response.data.avatarUrl);
      }

      toast.success("Profile updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (error.response?.data?.error === "Email already in use") {
        toast.error("Email address is already in use");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-350 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">
              Update your personal information and avatar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                      {userData.name
                        ? userData.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition-colors"
                >
                  <i className="fas fa-camera text-sm"></i>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Click the camera icon to change your profile picture
                </p>
                <p className="text-xs text-gray-500">JPG, PNG or GIF - Max 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                  Area of Expertise *
                </label>
                <select
                  id="expertise"
                  name="expertise"
                  value={userData.expertise || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select your expertise</option>
                  <option value="Development">Development</option>
                  <option value="Business">Business</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Office Productivity">Office Productivity</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Music">Music</option>
                  <option value="Teaching & Academics">Teaching & Academics</option>
                </select>
              </div>

              <div>
                <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  value={userData.experienceYears || ""}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
                  Headline (short tagline)
                </label>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  value={userData.headline || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Web Developer & Mentor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={userData.linkedin || ""}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website / Portfolio
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={userData.website || ""}
                  onChange={handleInputChange}
                  placeholder="https://your-site.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={userData.bio || ""}
                onChange={handleInputChange}
                placeholder="Tell students about yourself, your experience, and teaching style..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/instructor-dashboard")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}