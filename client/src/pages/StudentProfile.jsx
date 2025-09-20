import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState("info");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

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
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        "/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            My Profile
          </h1>

          <div className="flex space-x-6 border-b mb-6 justify-center">
            {["info", "password"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-2 font-medium transition ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "info" ? "Profile Info" : "Password & Security"}
              </button>
            ))}
          </div>

          {activeTab === "info" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-6 justify-center">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  value={userData.bio || ""}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/student-dashboard")}
                  className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🔒 Password & Security
              </h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Old Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary mx-auto block"
                    placeholder="Enter old password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary mx-auto block"
                    placeholder="Enter new password"
                  />

                  {newPassword && (
                    <div className="w-80 mx-auto mt-2 text-sm">
                      {newPassword.length < 6 ? (
                        <p className="text-red-600">
                          Weak – minimum 6 characters
                        </p>
                      ) : /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(
                          newPassword
                        ) ? (
                        <p className="text-green-600">
                          Strong – good choice ✅
                        </p>
                      ) : (
                        <p className="text-yellow-600">
                          Medium – add a number, uppercase & symbol
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary mx-auto block"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-80 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 mx-auto block font-medium"
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}