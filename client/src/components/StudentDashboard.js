import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const [userRes, enrolledRes] = await Promise.all([
        axios.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/courses/enrolled/my-courses", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(userRes.data);
      setEnrolledCourses(enrolledRes.data);

      const earned = enrolledRes.data.filter(c => (c.progress || 0) >= 100);
      setCertificates(earned);

      const allRes = await axios.get("/api/courses?limit=50");
      const pool = allRes.data.data || [];
      const enrolledIds = new Set(enrolledRes.data.map(c => c._id));
      const available = pool.filter(c => !enrolledIds.has(c._id));
      const random3 = available.sort(() => 0.5 - Math.random()).slice(0, 3);
      setRecommendedCourses(random3);
    } catch (err) {
      toast.error("Failed to load dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Enrolled successfully!");
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Enrollment failed");
    }
  };

  const handleUnenrollCourse = async () => {
    if (!confirmUnenroll) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/api/courses/${confirmUnenroll}/unenroll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Unenrolled successfully!");
      setConfirmUnenroll(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Unenroll failed");
    }
  };

  const continueLearning = enrolledCourses[0];
  const realLessonsCompleted = enrolledCourses.reduce((total, c) => {
    return 0;
  }, 0);

  const stats = useMemo(() => [
    { icon: "fas fa-book-open", val: enrolledCourses.length, label: "Enrolled Courses", color: "blue" },
    { icon: "fas fa-check-circle", val: realLessonsCompleted, label: "Lessons Completed", color: "green" },
    { icon: "fas fa-certificate", val: certificates.length, label: "Certificates", color: "yellow" }
  ], [enrolledCourses, certificates]);

  if (loading) return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-lg shadow p-6"><div className="h-4 bg-gray-200 rounded mb-4" /></div>)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Student"}!</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey and track your progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 bg-${s.color}-100 rounded-lg`}><i className={`${s.icon} text-${s.color}-600 text-xl`} /></div>
                <div className="ml-4"><p className="text-2xl font-bold text-gray-900">{s.val}</p><p className="text-gray-600">{s.label}</p></div>
              </div>
            </div>
          ))}
        </div>

        {continueLearning && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
              <Link to="/courses" className="text-primary hover:text-blue-800">View All Courses →</Link>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row gap-6">
              <img src={continueLearning.thumbnail} alt={continueLearning.title} className="w-full md:w-48 h-32 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{continueLearning.title}</h3>
                <p className="text-gray-600 mb-2">by {continueLearning.instructor}</p>
                <div className="flex gap-4 mt-4">
                  <Link to={`/course/${continueLearning._id}/learn`} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">Continue Course</Link>
                  <button onClick={() => setConfirmUnenroll(continueLearning._id)} className="text-red-600 hover:text-red-800"><i className="fas fa-trash" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {["enrolled", "recommended", "achievements"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? "border-blue-500 text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {tab === "enrolled" ? "My Courses" : tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === "enrolled" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map(c => (
                  <div key={c._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <img src={c.thumbnail} alt={c.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{c.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">by {c.instructor}</p>
                      <div className="flex justify-between items-center">
                        <Link to={`/course/${c._id}/learn`} className="text-primary hover:text-blue-800 text-sm font-medium">Continue →</Link>
                        <button onClick={() => setConfirmUnenroll(c._id)} className="text-red-600 hover:text-red-800 text-sm"><i className="fas fa-trash" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "recommended" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedCourses.map(c => (
                  <div key={c._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <img src={c.thumbnail ? `http://localhost:5000${c.thumbnail}` : "https://via.placeholder.com/400x250"} alt={c.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{c.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">by {c.instructor?.name || "Instructor"}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">${Number(c.price || 0).toFixed(2)}</span>
                        <button onClick={() => handleEnrollCourse(c._id)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Enroll Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="text-center py-12">
                <i className="fas fa-trophy text-4xl text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Achievements</h3>
                <p className="text-gray-600">Complete courses to unlock achievements and certificates!</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {[{ icon: "fa-graduation-cap", color: "blue", title: "First Course", desc: "Complete your first course" },
                  { icon: "fa-fire", color: "orange", title: "Learning Streak", desc: "Learn for 7 consecutive days" },
                  { icon: "fa-star", color: "purple", title: "Top Student", desc: "Complete 5 courses with 90%+ progress" }]
                    .map(a => (
                      <div key={a.title} className="bg-gray-50 rounded-lg p-4">
                        <i className={`fas ${a.icon} text-2xl text-${a.color}-600 mb-2`} />
                        <h4 className="font-semibold">{a.title}</h4>
                        <p className="text-sm text-gray-600">{a.desc}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmUnenroll && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Unenroll</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to unenroll from this course?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmUnenroll(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUnenrollCourse}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Unenroll
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}