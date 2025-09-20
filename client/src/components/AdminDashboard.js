import { useState, useEffect, useMemo } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { toast } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (let key in intervals) {
    const value = Math.floor(seconds / intervals[key]);
    if (value >= 1) {
      return `${value} ${key}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

function ConfirmDialog({ open, onClose, onConfirm, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-2 text-sm text-gray-600">{children}</div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCourseModal({ open, onClose, course, onEdit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    zoomLink: '',
    googleClassroomLink: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [preview, setPreview] = useState(null);

useEffect(() => {
  if (course) {
    setFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      level: course.level || "",
      price: course.price || "",
      zoomLink: course.zoomLink || "",
      googleClassroomLink: course.googleClassroomLink || ""
    });
    setPreview(course.thumbnail ? `http://localhost:5000${course.thumbnail}` : null);
  }
}, [course]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }

      await axios.put(`/api/courses/${course._id}`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      onEdit();
      toast.success("Course updated successfully");
      onClose();
    } catch (err) {
      console.error("Edit error:", err);
      toast.error(err.response?.data?.message || "Failed to update course");
    }
  };

  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Course Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {[
                "Development",
                "Business",
                "Finance & Accounting",
                "IT & Software",
                "Office Productivity",
                "Personal Development",
                "Design",
                "Marketing",
                "Lifestyle",
                "Photography & Video",
                "Health & Fitness",
                "Music",
                "Teaching & Academics",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={3}
            name="description"
            placeholder="Course Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <input
              type="number"
              name="price"
              placeholder="Price (USD)"
              value={formData.price}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              name="zoomLink"
              placeholder="Zoom Meeting Link"
              value={formData.zoomLink}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              name="googleClassroomLink"
              placeholder="Google Classroom Link"
              value={formData.googleClassroomLink}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              id="edit-thumbnail-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="edit-thumbnail-upload" className="cursor-pointer">
              {preview ? (
                <img src={preview} alt="preview" className="h-32 w-full object-cover rounded-lg mx-auto" />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <i className="fas fa-upload text-2xl mb-2" />
                  <span>Click to upload new thumbnail</span>
                </div>
              )}
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-brown"
            >
              Update Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalRevenue: 0,
    recentSignups: 0,
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [delCourse, setDelCourse] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [activity, setActivity] = useState([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [allActivity, setAllActivity] = useState([]);
  const [delUser, setDelUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [monthlyActive, setMonthlyActive] = useState(0);
  const [subscribers, setSubscribers] = useState([]);

  const [settings, setSettings] = useState({
    platformName: "StudentHub",
    maintenanceMode: false,
    smtpHost: "",
    smtpPort: "",
    emailFrom: "",
    notifications: true,
    theme: "light",
  });

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put("/api/admin/settings", settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Settings saved successfully");
      window.location.reload();
    } catch (err) {
      console.error("Save settings failed:", err);
      toast.error("Failed to save settings");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
useEffect(() => {
  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(data);
       
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };
  
  fetchSettings();
  }, []);

useEffect(() => {
  if (activeTab === "activity") {
    fetchAllActivity();
  }
}, [activeTab]);
const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const [
      { data: statsData },
      { data: usersData },
      { data: coursesData },
      { data: revData },
      { data: growthData },
      { data: monthlyRevData },
      { data: activityData }, 
      { data: mauData },
      { data: settingsData },
      { data: subscribersData },
    ] = await Promise.all([
      axios.get("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/courses", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/revenue", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/user-growth", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/revenue/monthly", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/activity", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/monthly-active", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/subscribers", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSettings(settingsData);
      setSubscribers(subscribersData);

    setStats({ ...statsData, totalRevenue: revData.totalRevenue });
    setUsers(usersData);
    setCourses(coursesData);
    setUserGrowth(growthData.monthlyUsers);
    setMonthlyRevenue(monthlyRevData.monthlyRevenue);
    setActivity(activityData);
    setMonthlyActive(mauData.monthlyActive);
  } catch (err) {
    toast.error("Failed to load dashboard data");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleCSVDownload = async (type) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`/api/admin/reports/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

const fetchAllActivity = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const { data } = await axios.get("/api/admin/activity?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAllActivity(data);
  } catch (err) {
    toast.error("Failed to load activity feed");
    console.error(err);
  }
};

const chartData = useMemo(() => ({
  userDistribution: {
    labels: ["Students", "Instructors", "Admins"],
    datasets: [{
      data: [
        users.filter((u) => u.role === "student").length,
        users.filter((u) => u.role === "instructor").length,
        users.filter((u) => u.role === "admin").length,
      ],
      backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
      borderWidth: 1,
    }],
  },
  userGrowth: {
    labels: userGrowth.map((d) => d.month),
    datasets: [{
      label: "New Users",
      data: userGrowth.map((d) => d.count),
      borderColor: "#36a2eb",
      backgroundColor: "rgba(54,162,235,0.2)",
      tension: 0.4,
    }],
  },
  revenue: {
    labels: monthlyRevenue.map((d) => d.month),
    datasets: [{
      label: "Revenue ($)",
      data: monthlyRevenue.map((d) => d.amount),
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "#4bc0c0",
      borderWidth: 2,
    }],
  }
}), [users, userGrowth, monthlyRevenue]);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  const instructorRows = useMemo(() => {
    return users
      .filter((u) => u.role === "instructor")
      .map((ins) => ({
        ...ins,
        studentCount: courses
          .filter((c) => c.instructorId === ins.id)
          .reduce((sum, c) => sum + (c.students || 0), 0),
      }));
  }, [users, courses]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your learning platform efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8 auto-rows-fr">
          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col items-center justify-center text-center">
            <i className="fas fa-users text-blue-500 text-3xl mb-2"></i>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "student" || u.role === "instructor").length}</div>
            <div className="text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col items-center justify-center text-center">
            <i className="fas fa-user-graduate text-indigo-500 text-3xl mb-2"></i>
            <div className="text-2xl font-bold">{users.filter(u => u.role === "student").length}</div>
            <div className="text-gray-600">Students</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col items-center justify-center text-center">
            <i className="fas fa-chalkboard-teacher text-purple-500 text-3xl mb-2"></i>
            <div className="text-2xl font-bold">{stats.totalInstructors}</div>
            <div className="text-gray-600">Instructors</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col items-center justify-center text-center">
            <i className="fas fa-book text-green-500 text-3xl mb-2"></i>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <div className="text-gray-600">Total Courses</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col items-center justify-center text-center">
            <i className="fas fa-dollar-sign text-yellow-500 text-3xl mb-2"></i>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-gray-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col items-center justify-center text-center">
            <i className="fas fa-user-plus text-red-500 text-3xl mb-2"></i>
            <div className="text-2xl font-bold">+{stats.recentSignups}</div>
            <div className="text-gray-600">New Signups (7d)</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav
              className="flex overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
              {[
                "overview",
                "students",
                "instructors",
                "courses",
                "activity",
                "reports",
                "Socials & subscribers",
                "settings",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm capitalize flex-shrink-0 ${
                    activeTab === tab
                      ? "border-blue-500 text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                  <div className="h-64">
                    <Line data={chartData.userGrowth} options={chartOptions} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Revenue Tracking</h3>
                  <div className="h-64">
                    <Bar data={chartData.revenue} options={chartOptions} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
                  <div className="h-64">
                    <Pie data={chartData.userDistribution} options={chartOptions} />
                  </div>
                </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {activity.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  ) : (
                    activity.map((act, i) => (
                      <div key={i} className="flex items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {act.action}{act.course ? ` (${act.course})` : ""}
                          </p>
                          <p className="text-xs text-gray-500">by {act.user}</p>
                        </div>
                        <span className="text-xs text-gray-400">{timeAgo(act.time)}</span>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("authToken");
                      const { data } = await axios.get("/api/admin/activity?limit=50", {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setAllActivity(data);
                      setShowAllActivity(true);
                    } catch (err) {
                      toast.error("Failed to load all activity");
                    }
                  }}
                  className="mt-4 text-primary text-sm hover:underline"
                >
                  View All Activity →
                </button>
              </div>

              {showAllActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl overflow-y-auto max-h-[80vh]">
                    <h2 className="text-xl font-bold mb-4">All Activity</h2>
                    <div className="space-y-3">
                      {allActivity.map((act, i) => (
                        <div key={i} className="flex items-center p-3 bg-gray-50 rounded border">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {act.action}{act.course ? ` (${act.course})` : ""}
                            </p>
                            <p className="text-xs text-gray-500">by {act.user}</p>
                          </div>
                          <span className="text-xs text-gray-400">{timeAgo(act.time)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-right">
                      <button
                        onClick={() => setShowAllActivity(false)}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-brown"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}

            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Student Management</h3>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-brown">
                    <i className="fas fa-plus mr-2"></i>Add Student
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Joined</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((u) => u.role === "student")
                        .map((u) => (
                          <tr key={u._id} className="border-b">
                            <td className="px-4 py-3">{u.name}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>

                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditUser(u)}
                                  className="text-primary hover:text-blue-800"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => setDelUser(u)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

            <ConfirmDialog
              open={!!delUser}
              onClose={() => setDelUser(null)}
              onConfirm={async () => {
                try {
                  const token = localStorage.getItem("authToken");
                  await axios.delete(`/api/admin/users/${delUser._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setUsers(prev => prev.filter(u => u._id !== delUser._id));
                  toast.success("User deleted successfully");
                } catch (err) {
                  toast.error("Failed to delete user");
                }
              }}
              title="Delete user"
            >
              Are you sure you want to delete <strong>{delUser?.name}</strong>? This action
              cannot be undone.
            </ConfirmDialog>
            {editUser && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit User</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const token = localStorage.getItem("authToken");
                        await axios.put(`/api/admin/users/${editUser._id}`, editUser, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setUsers(prev =>
                          prev.map(u => (u._id === editUser._id ? editUser : u))
                        );
                        toast.success("User updated successfully");
                        setEditUser(null);
                      } catch (err) {
                        toast.error("Failed to update user");
                      }
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg"
                      placeholder="Name"
                      required
                    />
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg"
                      placeholder="Email"
                      required
                    />
                    <select
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditUser(null)}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-brown"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}     
            </div>
            )}

            {activeTab === "courses" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Course Management</h3>
                  <a href="/courses" className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-brown" target="_blank">  
                    <i className="fas fa-eye mr-2"></i>Live Page
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((c) => (
                    <div key={c._id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{c.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        by {c.instructor?.name || "Unknown"}
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">{c.students || 0} students</span>
                        <span className="font-bold">${c.price}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          c.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>{c.status ?? "draft"}</span>
                        <div className="flex space-x-2 ml-2">
                          <button
                            onClick={() => setEditCourse(c)}
                            className="text-primary hover:text-blue-800"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => setDelCourse(c)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <ConfirmDialog
                  open={!!delCourse}
                  onClose={() => setDelCourse(null)}
                  onConfirm={async () => {
                    try {
                      const token = localStorage.getItem("authToken");
                      await axios.delete(`/api/courses/${delCourse._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setCourses((prev) => prev.filter((x) => x._id !== delCourse._id));
                      toast.success("Course deleted");
                    } catch (e) {
                      toast.error("Delete failed");
                    }
                  }}
                  title="Delete course"
                >
                  Are you sure you want to delete <strong>{delCourse?.title}</strong>? This action
                  cannot be undone.
                </ConfirmDialog>
                {editCourse && (
                  <EditCourseModal
                    open={!!editCourse}
                    onClose={() => setEditCourse(null)}
                    course={editCourse}
                    onEdit={() => {
                      setCourses((prev) =>
                        prev.map((c) => (c._id === editCourse._id ? { ...c, ...editCourse } : c))
                      );
                    }}
                  />
                )}
              </div>
            )}

            {activeTab === "instructors" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Instructor Management</h3>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-brown">
                    <i className="fas fa-plus mr-2"></i>Add Instructor
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Instructor</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Students</th>
                        <th className="px-4 py-2 text-left">Joined</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructorRows.map((ins) => (
                        <tr key={ins.id} className="border-b">
                          <td className="px-4 py-3">{ins.name}</td>
                          <td className="px-4 py-3">{ins.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                              {ins.studentCount}
                            </span>
                          </td>
                          <td className="px-4 py-3">{ins.createdAt ? new Date(ins.createdAt).toLocaleDateString() : "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                                <button onClick={() => setEditUser(ins)} className="text-primary hover:text-blue-800"> <i className="fas fa-edit"></i></button>
                                <button onClick={() => setDelUser(ins)} className="text-red-600 hover:text-red-800"> <i className="fas fa-trash"></i> </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ConfirmDialog
                  open={!!delUser}
                  onClose={() => setDelUser(null)}
                  onConfirm={async () => {
                    try {
                      const token = localStorage.getItem("authToken");
                      await axios.delete(`/api/admin/users/${delUser._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setUsers((prev) => prev.filter((u) => u._id !== delUser._id));
                      toast.success("Instructor deleted");
                    } catch (e) {
                      toast.error("Delete failed");
                    }
                  }}
                  title="Delete Instructor"
                >
                  Are you sure you want to delete <strong>{delUser?.name}</strong>? This action cannot be undone.
                </ConfirmDialog>
                {editUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
                      <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit User</h2>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            const token = localStorage.getItem("authToken");
                            await axios.put(`/api/admin/users/${editUser._id}`, editUser, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            setUsers((prev) =>
                              prev.map((u) => (u._id === editUser._id ? editUser : u))
                            );
                            toast.success("User updated successfully");
                            setEditUser(null);
                          } catch (err) {
                            console.error("Error updating user:", err);
                            toast.error("Failed to update user");
                          }
                        }}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          value={editUser.name}
                          onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                          className="w-full border px-3 py-2 rounded-lg"
                          placeholder="Name"
                          required
                        />
                        <input
                          type="email"
                          value={editUser.email}
                          onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                          className="w-full border px-3 py-2 rounded-lg"
                          placeholder="Email"
                          required
                        />
                        <select
                          value={editUser.role}
                          onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                          className="w-full border px-3 py-2 rounded-lg"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setEditUser(null)}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-brown"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                </div>
                </div>
            )}

            {activeTab === "reports" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Reports & Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Generate Reports</h4>
                    <div className="space-y-3">
                    <button 
                      onClick={() => handleCSVDownload("users")} 
                      className="w-full bg-white border p-3 rounded-lg text-left hover:bg-gray-100"
                    >
                      <i className="fas fa-download mr-2"></i>User Activity Report (CSV)
                    </button>
                    <button 
                      onClick={() => handleCSVDownload("revenue")} 
                      className="w-full bg-white border p-3 rounded-lg text-left hover:bg-gray-100"
                    >
                      <i className="fas fa-download mr-2"></i>Revenue Report (CSV)
                    </button>
                    <button 
                      onClick={() => handleCSVDownload("courses")} 
                      className="w-full bg-white border p-3 rounded-lg text-left hover:bg-gray-100"
                    >
                      <i className="fas fa-download mr-2"></i>Course Performance (CSV)
                    </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Quick Stats</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">New Signups (7 days)</p>
                      <p className="text-2xl font-bold">+{stats.recentSignups}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue (Last Month)</p>
                      <p className="text-2xl font-bold">
                        $
                        {monthlyRevenue.length > 0
                          ? monthlyRevenue[monthlyRevenue.length - 1].amount.toLocaleString()
                          : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Active Users</p>
                      <p className="text-2xl font-bold">{monthlyActive}</p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "activity" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">All Activity</h3>
                {allActivity.length === 0 ? (
                  <p className="text-sm text-gray-500">No activity recorded</p>
                ) : (
                  <div className="space-y-3">
                    {allActivity.map((act, i) => (
                      <div key={i} className="flex items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {act.action}{act.course ? ` (${act.course})` : ""}
                          </p>
                          <p className="text-xs text-gray-500">by {act.user}</p>
                        </div>
                        <span className="text-xs text-gray-400">{timeAgo(act.time)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Socials & subscribers" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Socials & Subscribers</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Social Links</h4>
                    <div className="space-y-4">
                      {["facebook", "twitter", "instagram", "linkedin"].map((key) => (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
                          <input
                            type="url"
                            placeholder={`Enter ${key} URL`}
                            value={settings.social?.[key] || ""}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                social: { ...settings.social, [key]: e.target.value },
                              })
                            }
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={saveSettings}
                      className="mt-6 bg-primary text-white px-4 py-2 rounded hover:bg-primary-700"
                    >
                      Save
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">Newsletter Subscribers</h4>
                    {subscribers.length === 0 ? (
                      <p className="text-sm text-gray-500">No subscribers yet.</p>
                    ) : (
                      <div className="overflow-y-auto max-h-96 border rounded">
                        <table className="w-full table-auto text-sm">
                          <thead className="sticky top-0 bg-white shadow">
                            <tr>
                              <th className="px-4 py-2 text-left">Email</th>
                              <th className="px-4 py-2 text-left">Subscribed At</th>
                              <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subscribers.map((s) => (
                              <tr key={s._id} className="border-t">
                                <td className="px-4 py-2">{s.email}</td>
                                <td className="px-4 py-2">
                                  {s.createdAt
                                    ? new Date(s.createdAt).toLocaleDateString()
                                    : "—"}
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const token = localStorage.getItem("authToken");
                                        await axios.delete(`/api/admin/subscribers/${s._id}`, {
                                          headers: { Authorization: `Bearer ${token}` },
                                        });
                                        setSubscribers((prev) =>
                                          prev.filter((x) => x._id !== s._id)
                                        );
                                        toast.success("Subscriber removed");
                                      } catch (err) {
                                        toast.error("Failed to remove subscriber");
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {activeTab === "settings" && (
          <div>
            <h3 className="text-lg font-semibold mb-6">Platform Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">General Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform Name</label>
                    <input 
                      type="text"
                      className="w-full p-2 border rounded"
                      value={settings.platformName}
                      onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={settings.theme}
                      onChange={e => setSettings({ ...settings, theme: e.target.value })}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Maintenance Mode</label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      />
                      <span className="ml-2">Enable Maintenance Mode</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Email Settings</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="SMTP Host"
                    value={settings.smtpHost}
                    onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                  />
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="SMTP Port"
                    value={settings.smtpPort}
                    onChange={e => setSettings({ ...settings, smtpPort: e.target.value })}
                  />
                  <input
                    type="email"
                    className="w-full p-2 border rounded"
                    placeholder="From Email"
                    value={settings.emailFrom}
                    onChange={e => setSettings({ ...settings, emailFrom: e.target.value })}
                  />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={e => setSettings({ ...settings, notifications: e.target.checked })}
                    />
                    <span className="ml-2">Enable Email Notifications</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={saveSettings}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-brown"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: "bg-blue-100 text-primary",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <i className={`fas fa-${icon} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-gray-600">{label}</p>
        </div>
      </div>
      </div>
  );
}