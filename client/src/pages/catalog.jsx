import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

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

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [rawCourses, setRawCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const page = Number(params.get("page") || 1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/courses");
      setRawCourses(res.data.data || []);
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCourses = rawCourses.filter((c) => {
    let ok = true;
    const priceFilter = params.get("price");
    if (priceFilter === "Free") ok = ok && c.price === 0;
    if (priceFilter === "1 - 20") ok = ok && c.price > 0 && c.price <= 20;
    if (priceFilter === "21 - 40") ok = ok && c.price >= 21 && c.price <= 40;
    if (priceFilter === "41 - 50") ok = ok && c.price >= 41 && c.price <= 50;
    if (priceFilter === "50+") ok = ok && c.price > 50;

    const ratingFilter = params.get("rating");
    if (ratingFilter) ok = ok && c.rating >= parseFloat(ratingFilter);

    const q = params.get("q") || "";
    if (q) ok = ok && c.title.toLowerCase().includes(q.toLowerCase());

    const cat = params.get("category");
    if (cat) ok = ok && c.category === cat;

    const lvl = params.get("level");
    if (lvl) ok = ok && c.level === lvl;

    return ok;
  });

  let displayCourses = [...filteredCourses];
  const sortKey = params.get("sort") || "relevance";
  switch (sortKey) {
    case "rating":
      displayCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "newest":
      displayCourses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    case "price-asc":
      displayCourses.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price-desc":
      displayCourses.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    default:
      break;
  }

  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(displayCourses.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedCourses = displayCourses.slice(start, start + PAGE_SIZE);

  const onPage = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  };

  const filterCategories = [
    {
      key: "category",
      label: "Category",
      options: [
        "",
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
      ],
    },
    { key: "level", label: "Level", options: ["", "Beginner", "Intermediate", "Advanced"] },
    { key: "price", label: "Price", options: ["", "Free", "1 - 20", "21 - 40", "41 - 50", "50+"] },
    { key: "rating", label: "Rating", options: ["", "4.5", "4.0", "3.5"] },
  ];

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">All Courses</h1>

      <div className="grid lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="font-semibold mb-2">Search</div>
            <input
              value={params.get("q") || ""}
              onChange={(e) => {
                const p = new URLSearchParams(params);
                e.target.value ? p.set("q", e.target.value) : p.delete("q");
                p.set("page", "1");
                setParams(p);
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. React"
            />
          </div>

          {filterCategories.map((f) => (
            <div key={f.key} className="bg-white rounded-lg p-4 border">
              <div className="font-semibold mb-2">{f.label}</div>
              <select
                value={params.get(f.key) || ""}
                onChange={(e) => {
                  const p = new URLSearchParams(params);
                  e.target.value ? p.set(f.key, e.target.value) : p.delete(f.key);
                  p.set("page", "1");
                  setParams(p);
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o === "" ? "Any" : o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </aside>

        <section className="lg:col-span-9">
          <div className="bg-white rounded-lg p-3 border flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">{displayCourses.length} results</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort</span>
              <select
                value={params.get("sort") || "relevance"}
                onChange={(e) => {
                  const p = new URLSearchParams(params);
                  p.set("sort", e.target.value);
                  p.set("page", "1");
                  setParams(p);
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-white border p-6 animate-pulse">
                    <div className="bg-gray-200 rounded-xl w-full h-48 mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))
              : paginatedCourses.length
              ? paginatedCourses.map((c) => <CourseCard key={c._id} course={c} />)
              : (
                <div className="col-span-full p-6 text-center border rounded-lg bg-white">
                  <div className="font-semibold">No courses found</div>
                  <div className="text-gray-500 text-sm">Try different filters or search terms.</div>
                </div>
              )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow-sm isolate" aria-label="Pagination">
                <button
                  onClick={() => onPage(Math.max(1, page - 1))}
                  className="px-3 py-2 ring-1 ring-gray-300 bg-white text-sm rounded-l-md"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPage(p)}
                    className={`px-3 py-2 ring-1 ring-gray-300 text-sm ${
                      p === page ? "bg-primary text-white" : "bg-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => onPage(Math.min(page + 1, totalPages))}
                  className="px-3 py-2 ring-1 ring-gray-300 bg-white text-sm rounded-r-md"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}