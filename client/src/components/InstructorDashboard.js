import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const [statsRes, coursesRes] = await Promise.all([
        axios.get("/api/instructors/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/instructors/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data.data || statsRes.data || {});

      const coursesData = coursesRes.data.data || coursesRes.data;
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteCourse = async () => {
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/api/courses/${confirmDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Course deleted!");
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course");
    }
  };

  const courseStudentsChart = {
    labels: courses.map((c) => c.title),
    datasets: [
      {
        label: "Students",
        data: courses.map((c) => c.enrollments || 0),
        backgroundColor: "rgba(59, 130, 246, 0.75)",
        borderColor: "#3b82f6",
        borderWidth: 0,
        borderRadius: 8,
        barThickness: "flex",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, color: "#6b7280" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb", drawBorder: false },
        ticks: { color: "#6b7280" },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Instructor Dashboard</h1>
        <button
          onClick={() => navigate("/instructor/courses/new")}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-3xl font-bold text-primary">{stats.totalCourses || courses.length || 0}</h2>
          <p className="text-gray-600">Courses</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-3xl font-bold text-green-600">{stats.totalStudents || 0}</h2>
          <p className="text-gray-600">Students</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-3xl font-bold text-yellow-600">
            {stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
          </h2>
          <p className="text-gray-600">Avg. Rating</p>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Students per Course</h2>
          <div className="relative w-full h-[350px]">
            <Bar data={courseStudentsChart} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Courses</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-book-open text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-500">No courses yet</h3>
            <p className="text-gray-400 mt-2">Create your first course to get started</p>
            <button
              onClick={() => navigate("/instructor/courses/new")}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c._id}
                className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                <img
                  src={c.thumbnail ? `${API_BASE}${c.thumbnail}` : "https://via.placeholder.com/400x200"}
                  alt={c.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-gray-800">{c.title}</h3>
                  <p className="text-sm text-gray-500">{c.enrollments || 0} students</p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => navigate(`/instructor/courses/${c._id}/edit`)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(c._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}