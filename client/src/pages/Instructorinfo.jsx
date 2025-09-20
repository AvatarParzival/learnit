import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function InstructorProfile() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const { data } = await axios.get(`/api/instructors/${id}`);
        console.log("Instructor API response:", data);
        setInstructor(data.data || data);
      } catch (err) {
        console.error("Failed to fetch instructor:", err);
        toast.error("Could not load instructor profile");
      } finally {
        setLoading(false);
      }
    };
    fetchInstructor();
  }, [id]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`/api/courses`, {
          params: { instructorId: id },
        });
        setCourses(data.data || data || []);
      } catch (err) {
        console.error("Failed to fetch instructor courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [id]);

  function CourseCard({ course }) {
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [checkingEnrollment, setCheckingEnrollment] = useState(true);

    const price = course?.price ?? 89.99;
    const title = course?.title ?? "Awesome Course";
    const description = course?.description ?? "Learn from basics to advanced with real projects.";
    const category = course?.category ?? "Web Development";
    const enrollments = course?.enrollments ?? 0;

    const instructorName = course?.instructor?.name ?? "Expert Instructor";
    const instructorAvatar = course?.instructor?.avatarUrl
      ? `http://localhost:5000${course.instructor.avatarUrl}`
      : null;

    const thumbnail = course?.thumbnail
      ? `http://localhost:5000${course.thumbnail}`
      : null;

    const getInitials = (name = "") =>
      name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    const avatarColor = (name = "") => {
      const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500"];
      const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
      return colors[idx];
    };

    useEffect(() => {
      const checkEnrollment = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setCheckingEnrollment(false);
          return;
        }
        try {
          const res = await fetch(`/api/courses/enrolled/check/${course._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setIsEnrolled(data.isEnrolled);
          }
        } catch (err) {
          console.error("Enrollment check failed:", err);
        } finally {
          setCheckingEnrollment(false);
        }
      };
      checkEnrollment();
    }, [course._id]);

    const handleEnroll = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.warning("Please login to enroll", { position: "top-right" });
        return;
      }

      const role = localStorage.getItem("role");
      if (role !== "student") {
        toast.error("Only students can enroll in courses", { position: "top-right" });
        return;
      }

      const loadingToast = toast.loading("Processing enrollment...", { position: "top-right" });

      try {
        const res = await fetch(`/api/courses/${course._id}/enroll`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Enrollment failed");
        }

        toast.update(loadingToast, {
          render: "🎉 Successfully enrolled in course!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          position: "top-right",
        });

        setIsEnrolled(true);
        course.enrollments += 1;
      } catch (err) {
        toast.update(loadingToast, {
          render: `${err.message || "Failed to enroll in course"}`,
          type: "error",
          isLoading: false,
          autoClose: 4000,
          position: "top-right",
        });
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden course-card">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-48 object-cover" />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
        )}

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-flex bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium items-center">
                {category}
              </span>
              <h3 className="mt-2 text-xl font-bold">{title}</h3>
            </div>
            <span className="text-lg font-bold text-primary">${Number(price).toFixed(2)}</span>
          </div>
          <p className="mt-3 text-gray-500 line-clamp-2">{description}</p>

          <div className="mt-4 flex items-center">
            {instructorAvatar ? (
              <img className="h-10 w-10 rounded-full object-cover" src={instructorAvatar} alt={instructorName} />
            ) : (
              <div className={`h-10 w-10 rounded-full ${avatarColor(instructorName)} flex items-center justify-center text-white font-semibold`}>
                {getInitials(instructorName)}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium">{instructorName}</p>
              <p className="text-sm text-gray-500">Course Instructor</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <i className="fas fa-star text-yellow-400"></i>
              <span className="ml-1">{(course.rating || 0).toFixed(1)} (0)</span>
            </div>
            <div className="text-sm text-gray-500">
              <i className="fas fa-users mr-1"></i> {enrollments} students
            </div>
          </div>

          <div className="mt-6">
            {checkingEnrollment ? (
              <button disabled className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md font-medium cursor-not-allowed">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Checking...
              </button>
            ) : isEnrolled ? (
              <button disabled className="w-full bg-green-500 text-white py-2 px-4 rounded-md font-medium cursor-not-allowed">
                <i className="fas fa-check mr-2"></i>
                Enrolled
              </button>
            ) : localStorage.getItem("role") !== "student" ? (
              <button disabled className="w-full bg-gray-300 text-gray-500 text-sm py-2 px-4 rounded-md font-medium cursor-not-allowed">
                <i className="fas fa-ban mr-2"></i>
                Only Students Can Enroll
              </button>
            ) : (
              <button type="button" onClick={handleEnroll} className="w-full bg-primary hover:bg-secondary text-white py-2 px-4 rounded-md font-medium transition-colors">
                <i className="fas fa-plus-circle mr-2"></i>
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (!instructor) return <p className="text-center mt-10">Instructor not found</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center">
        {instructor.avatarUrl ? (
          <img
            src={instructor.avatarUrl}
            alt={instructor.name}
            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center bg-blue-500 text-white text-3xl font-bold">
            {instructor.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
        )}

        <h1 className="text-3xl font-bold mt-4">{instructor.name}</h1>

        {instructor.headline && (
          <p className="text-gray-700 text-lg italic mt-1">“{instructor.headline}”</p>
        )}

        <p className="text-primary text-lg font-medium">
          {instructor.expertise || "Expert Instructor"}
        </p>

        <p className="mt-2 text-gray-600">
          <strong>Experience:</strong> {instructor.experienceYears ? `${instructor.experienceYears} years` : "Not specified"}
        </p>

        {(instructor.linkedin || instructor.website) && (
          <div className="flex justify-center gap-6 mt-4 text-gray-600">
            {instructor.linkedin && (
              <a
                href={instructor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700"
              >
                <i className="fab fa-linkedin text-2xl"></i>
              </a>
            )}
            {instructor.website && (
              <a
                href={instructor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-700"
              >
                <i className="fas fa-globe text-2xl"></i>
              </a>
            )}
          </div>
        )}

        <div className="mt-6 bg-white p-6 rounded-lg shadow text-left">
          <h2 className="text-xl font-semibold mb-3">About</h2>
          <p>{instructor.bio || "No biography provided yet."}</p>
        </div>

        <div className="mt-6">
          <Link to="/instructors" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            ← Back to Instructors
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Courses by {instructor.name}</h2>

        {loadingCourses ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">This instructor hasn’t published any courses yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}