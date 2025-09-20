import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

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

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
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
          headers: { 'Authorization': `Bearer ${token}` }
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

    const loadingToast = toast.loading("Processing enrollment...", {
      position: "top-right",
    });

    try {
      const res = await fetch(`/api/courses/${course._id}/enroll`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Enrollment failed');
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
            <span className="inline-flex bg-blue-100 text-blue-800 text-xs px-1 py-1 rounded-full font-medium items-center">
              {category}
            </span>
            <h3 className="mt-2 text-xl font-bold">{title}</h3>
          </div>
          <span className="text-lg font-bold text-primary">${Number(price).toFixed(2)}</span>
        </div>
        <p className="mt-3 text-gray-500 line-clamp-2">{description}</p>

        <div className="mt-4 flex items-center">
          {instructorAvatar ? (
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={instructorAvatar}
              alt={instructorName}
            />
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
            <button
              type="button"
              onClick={handleEnroll}
              className="w-full bg-primary hover:bg-secondary text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const CATS = ["All Courses", "Development", "Business", "Design", "Marketing", "Lifestyle"];

export default function Home() {
  const [settings, setSettings] = useState({
    platformName: "",
    theme: "light",
    maintenanceMode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const { data } = await axios.get("/api/admin/public-settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings, using defaults.");
      }
    };
    fetchSettings();
  }, []);

  const [active, setActive] = useState("All Courses");

  const [courses, setCourses] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [loadingC, setLoadingC] = useState(true);
  const [loadingF, setLoadingF] = useState(true);
  const [loadingI, setLoadingI] = useState(true);

  const featuredRef = useRef(null);
  const instructorsRef = useRef(null);

  const safeFetch = async (url, params = {}) => {
    try {
      const { data } = await axios.get(url, { params });
      return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    } catch (e) {
      toast.error(`Could not load ${url}`);
      console.error(e);
      return [];
    }
  };

  const scrollFeatured = (direction) => {
    if (featuredRef.current) {
      const scrollAmount = 400;
      featuredRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollInstructors = (direction) => {
    if (instructorsRef.current) {
      const scrollAmount = 400;
      instructorsRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    safeFetch("/api/courses", { limit: 9, sort: "trending" }).then(setCourses).finally(() => setLoadingC(false));
    safeFetch("/api/courses", { limit: 12, sort: "trending" }).then(setFeatured).finally(() => setLoadingF(false));
    safeFetch("/api/instructors", { limit: 8, sort: "rating" }).then(setInstructors).finally(() => setLoadingI(false));
  }, []);

  const filteredFeatured = active === "All Courses"
    ? featured
    : featured.filter(c => c.category && c.category.toLowerCase() === active.toLowerCase());

  const getInitials = (n = "") => (n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2));
  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
  const avatarColor = (n = "") => avatarColors[n.length % avatarColors.length];

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex justify-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star text-yellow-400 text-sm"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt text-yellow-400 text-sm"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star text-gray-300 text-sm"></i>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-12">
      <div className="mx-[calc(50%-50vw)] bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">
            Learn Anything. Anytime. Anywhere.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-indigo-100 text-lg">
            Join millions of students learning on {settings.platformName?.split(" ")[0] || "Student"}<span>{settings.platformName?.split(" ")[1] || "Hub"}</span>.
          </p>
          <Link
            to="/courses"
            className="mt-8 inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">Featured Courses</h2>
            <p className="mt-3 text-xl text-gray-500">Explore our most popular courses</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  active === c ? "bg-primary text-white shadow" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-10 relative">
            {filteredFeatured.length > 0 && (
              <button 
                onClick={() => scrollFeatured('left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors"
                style={{ marginLeft: '-1.5rem' }}
              >
                <i className="fas fa-chevron-left text-primary"></i>
              </button>
            )}
            
            <div 
              ref={featuredRef}
              className="flex overflow-x-auto space-x-6 px-4 py-6 scrollbar-hide"
              style={{ minHeight: '380px' }}
            >
              {loadingF
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-80 flex-shrink-0 bg-white rounded-xl shadow p-6 animate-pulse">
                      <div className="bg-gray-200 rounded w-full h-40" />
                      <div className="h-4 bg-gray-200 rounded mt-4 w-3/4" />
                    </div>
                  ))
                : filteredFeatured.length > 0 
                  ? filteredFeatured.map(c => (
                      <CourseCard key={c._id || c.id} course={c} />
                    ))
                  : (
                    <div className="flex-shrink-0 w-full flex items-center justify-center" style={{ minHeight: '409px' }}>
                      <div className="text-center py-8">
                        <i className="fas fa-book-open text-4xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl font-semibold text-gray-500">No courses found</h3>
                        <p className="text-gray-400 mt-2">Try selecting a different category</p>
                      </div>
                    </div>
                  )}
            </div>

            {filteredFeatured.length > 0 && (
              <button 
                onClick={() => scrollFeatured('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors"
                style={{ marginRight: '-1.5rem' }}
              >
                <i className="fas fa-chevron-right text-primary"></i>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold">How {settings.platformName?.split(" ")[0] || "Student"}
          <span className="text-brown">
            {settings.platformName?.split(" ")[1] || "Hub"}
          </span> Works</h2>
          <p className="mt-4 text-xl text-gray-500">Your learning journey in three steps</p>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {[
              { icon: "fa-search", title: "Find Your Course", text: "Browse thousands of courses." },
              { icon: "fa-book-open", title: "Learn Interactively", text: "Recorded videos & live Sessions." },
              { icon: "fa-certificate", title: "Earn Your Certificate", text: "Showcase your skills." },
            ].map(s => (
              <div key={s.title} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded bg-primary text-white flex items-center justify-center">
                  <i className={`fas ${s.icon} text-xl`} />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="text-gray-500 text-center mt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">Our Instructors</h2>
            <p className="mt-3 text-xl text-gray-500">Learn from industry experts</p>
          </div>

          <div className="mt-10 relative">
            {instructors.length > 0 && (
              <button 
                onClick={() => scrollInstructors('left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors"
                style={{ marginLeft: '-1.5rem' }}
              >
                <i className="fas fa-chevron-left text-primary"></i>
              </button>
            )}
            
            <div 
              ref={instructorsRef}
              className="flex overflow-x-auto space-x-6 px-4 py-6 scrollbar-hide"
              style={{ minHeight: '400px' }}
            >
              {loadingI
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-80 flex-shrink-0 bg-white rounded-xl shadow p-6 text-center animate-pulse">
                      <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto" />
                      <div className="h-6 bg-gray-200 rounded mt-4 w-3/4 mx-auto" />
                    </div>
                  ))
                : instructors.map(inst => (
                    <div key={inst._id || inst.id} className="w-80 flex-shrink-0 bg-white rounded-xl shadow p-6 text-center transition-transform hover:scale-105">
                      {inst.avatarUrl ? (
                        <img src={inst.avatarUrl} alt={inst.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg" />
                      ) : (
                        <div className={`w-32 h-32 rounded-full ${avatarColor(inst.name)} flex items-center justify-center text-white text-4xl font-bold mx-auto border-4 border-white shadow-lg`}>
                          {getInitials(inst.name)}
                        </div>
                      )}
                      <h3 className="mt-4 text-xl font-bold">{inst.name || "Instructor"}</h3>
                      <p className="text-primary font-semibold">{inst.expertise || "Specialist"}</p>
                      
                      <div className="mt-3">
                        {renderStars(inst.rating || 0)}
                        <span className="text-sm text-gray-600 ml-2">({(inst.rating || 0).toFixed(1)})</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">
                        {inst.courses || 0} courses • {inst.students || 0} students
                      </p>
                      
                      <Link
                        to={`/instructor/${inst._id}`}
                        className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
            </div>

            {instructors.length > 0 && (
              <button 
                onClick={() => scrollInstructors('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition-colors"
                style={{ marginRight: '-1.5rem' }}
              >
                <i className="fas fa-chevron-right text-primary"></i>
              </button>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}