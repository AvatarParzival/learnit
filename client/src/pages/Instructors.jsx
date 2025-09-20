import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EXPERTISE_OPTIONS = [
  "All",
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
];

const avatarColor = (name = "") => {
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500"];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <>
      {[...Array(full)].map((_, i) => (
        <i key={`f-${i}`} className="fas fa-star text-yellow-400" />
      ))}
      {half && <i className="fas fa-star-half-alt text-yellow-400" />}
      {[...Array(empty)].map((_, i) => (
        <i key={`e-${i}`} className="far fa-star text-gray-300" />
      ))}
    </>
  );
};

export default function Instructors() {
  const [allInstructors, setAllInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAllInstructors();
  }, []);

  useEffect(() => {
    filterInstructors();
  }, [searchTerm, selectedExpertise, allInstructors, currentPage]);

  const fetchAllInstructors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/instructors", {
        params: { limit: 100, sort: "rating" }
      });
      setAllInstructors(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
      toast.error("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  const filterInstructors = () => {
    let filtered = [...allInstructors];

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(inst => {
        const matchesName = inst.name.toLowerCase().includes(term);
        const matchesExpertise = inst.expertise && inst.expertise.toLowerCase().includes(term);
        return matchesName || matchesExpertise;
      });
    }

    if (selectedExpertise !== "All") {
      filtered = filtered.filter(inst =>
        inst.expertise && inst.expertise === selectedExpertise
      );
    }

    setFilteredInstructors(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredInstructors.length / itemsPerPage));
  
  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Our Instructors</h1>
          <p className="mt-4 text-xl text-gray-600">
            Learn from industry experts with real-world experience
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search instructors by name, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <select
            value={selectedExpertise}
            onChange={(e) => {
              setSelectedExpertise(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {EXPERTISE_OPTIONS.map((ex) => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </form>

        {!loading && (
          <div className="mb-6 text-sm text-gray-600">
            Showing {paginatedInstructors.length} of {filteredInstructors.length} instructors
            {searchTerm && ` for "${searchTerm}"`}
            {selectedExpertise !== "All" && ` in ${selectedExpertise}`}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse">
                <div className="w-28 h-28 rounded-full bg-gray-200 mx-auto mb-4" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-3" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : paginatedInstructors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No instructors found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedExpertise !== "All" 
                ? "Try adjusting your search criteria or check back later."
                : "No instructors available at the moment."
              }
            </p>
            {(searchTerm || selectedExpertise !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedExpertise("All");
                  setCurrentPage(1);
                }}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedInstructors.map((inst) => (
                <div key={inst._id} className="bg-white rounded-xl shadow p-5 text-center transition-shadow hover:shadow-lg">
                  {inst.avatarUrl ? (
                    <img
                      src={inst.avatarUrl}
                      alt={inst.name}
                      className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg ring-4 ring-gray-200"
                    />
                  ) : (
                    <div
                      className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto border-4 border-white shadow-lg ring-4 ring-gray-200 ${avatarColor(
                        inst.name
                      )}`}
                    >
                      {getInitials(inst.name)}
                    </div>
                  )}

                  <h3 className="mt-3 text-lg font-bold text-gray-900 truncate">{inst.name}</h3>
                  <p className="text-primary font-semibold text-sm truncate">{inst.expertise || "Expert Instructor"}</p>

                  <div className="mt-2 flex justify-center items-center">
                    {renderStars(inst.rating || 0)}
                    <span className="text-xs text-gray-600 ml-1">({(inst.rating || 0).toFixed(1)})</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-2">
                    {inst.courses || 0} courses • {inst.students || 0} students
                  </p>

                  <Link
                    to={`/instructor/${inst._id}`}
                    className="mt-4 inline-block w-full bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md bg-gray-200 text-sm disabled:opacity-50 hover:bg-gray-300 transition-colors"
                >
                  Prev
                </button>

                {startPage > 1 && (
                  <>
                    <button onClick={() => setCurrentPage(1)} className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors">
                      1
                    </button>
                    {startPage > 2 && <span className="px-1">...</span>}
                  </>
                )}

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      page === currentPage 
                        ? "bg-primary text-white hover:bg-primary-dark" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && <span className="px-1">...</span>}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md bg-gray-200 text-sm disabled:opacity-50 hover:bg-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}