import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Header() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [p, setP] = useState(0);
  const [settings, setSettings] = useState({
    platformName: "",
    theme: "light",
    maintenanceMode: false,
  });

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const avatar = localStorage.getItem("avatarUrl");

    setIsAuthed(!!token);
    setUserRole(role || "");
    setUserName(name || "User");
    setUserAvatar(avatar || "");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get("/api/admin/public-settings");
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings, using defaults.");
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("name");
    localStorage.removeItem("avatarUrl");
    localStorage.removeItem("role");

    setIsAuthed(false);
    setUserRole("");
    setUserName("");
    setUserAvatar("");
    setShowProfileDropdown(false);
    setShowMobileMenu(false);

    navigate("/");
  };

  const goToDashboard = () => {
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
    switch (userRole) {
      case "student":
        navigate("/student-dashboard");
        break;
      case "instructor":
        navigate("/instructor-dashboard");
        break;
      case "admin":
        navigate("/admindashboard");
        break;
      default:
        navigate("/");
    }
  };

  const goToProfile = () => {
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
    if (userRole === "instructor") {
      navigate("/instructor-profile");
    } else {
      navigate("/student-profile");
    }
  };

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const progress = Math.max(0, Math.min(1, y / 140));
        setP(progress);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const linkCls = ({ isActive }) =>
    [
      "relative px-1 pt-1 text-sm font-medium border-b-2 border-transparent",
      "text-gray-600 hover:text-gray-800 transition-colors duration-200 ease-out",
      "after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-primary",
      "after:transition-all after:duration-300 after:ease-out",
      isActive ? "text-primary after:w-full" : "after:w-0 hover:after:w-full",
    ].join(" ");

  const btnBase =
    "inline-flex items-center justify-center rounded-md text-sm font-medium text-white " +
    "h-9 w-28 px-4 transition-all duration-200 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ring-offset-2 " +
    "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0";

  const btnSign = `${btnBase} bg-primary hover:bg-secondary`;
  const btnLogin = `${btnBase} bg-primary hover:bg-secondary`;
  const btnAdmin = `${btnBase} bg-dark hover:bg-gray-800`;

  return (
    <nav className="sticky top-0 z-40">
      <div className="bg-white header-progress" style={{ ["--p"]: p }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img
                  src="/logo.png"
                  alt="Platform Logo"
                  className="h-8 w-auto mr-2"
                />
                <h1 className="text-xl font-bold text-gray-800">
                  {settings.platformName?.split(" ")[0] || "Student"}
                  <span className="text-brown">
                    {settings.platformName?.split(" ")[1] || "Hub"}
                  </span>
                </h1>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <NavLink to="/" end className={linkCls}>
                  Home
                </NavLink>
                <NavLink to="/courses" className={linkCls}>
                  Courses
                </NavLink>
                <NavLink to="/instructors" className={linkCls}>
                  Instructors
                </NavLink>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden md:flex items-center gap-2" ref={dropdownRef}>
                {!isAuthed ? (
                  <>
                    <Link to="/register" className={btnSign}>
                      <i className="fas fa-user-plus mr-2" /> Sign Up
                    </Link>
                    <Link to="/login" className={btnLogin}>
                      <i className="fas fa-right-to-bracket mr-2" /> Log in
                    </Link>
                    <Link to="/login/admin" className={btnAdmin}>
                      <i className="fas fa-user-shield mr-2" /> Admin
                    </Link>
                  </>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {userName}
                      </span>
                      <i
                        className={`fas fa-chevron-down text-xs text-gray-500 transition-transform ${
                          showProfileDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {userRole}
                          </p>
                        </div>
                        <button
                          onClick={goToDashboard}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <i className="fas fa-tachometer-alt mr-2"></i> My
                          Dashboard
                        </button>
                        <button
                          onClick={goToProfile}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <i className="fas fa-user mr-2"></i> Profile Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <i className="fas fa-sign-out-alt mr-2"></i> Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                ref={hamburgerRef}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {showMobileMenu ? (
                  <i className="fas fa-times text-xl" />
                ) : (
                  <i className="fas fa-bars text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        className={`md:hidden bg-white shadow-lg border-t transform transition-all duration-300 origin-top ${
          showMobileMenu
            ? "max-h-96 opacity-100 scale-y-100"
            : "max-h-0 opacity-0 scale-y-0"
        } overflow-hidden`}
      >
        <div className="px-4 py-3 space-y-2">
          <NavLink
            to="/"
            end
            className="block text-gray-700 py-2"
            onClick={() => setShowMobileMenu(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/courses"
            className="block text-gray-700 py-2"
            onClick={() => setShowMobileMenu(false)}
          >
            Courses
          </NavLink>
          <NavLink
            to="/instructors"
            className="block text-gray-700 py-2"
            onClick={() => setShowMobileMenu(false)}
          >
            Instructors
          </NavLink>

          {!isAuthed ? (
            <>
              <Link
                to="/register"
                className="block text-gray-700 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="block text-gray-700 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Log in
              </Link>
              <Link
                to="/login/admin"
                className="block text-gray-700 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Admin
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={goToDashboard}
                className="block text-gray-700 py-2 w-full text-left"
              >
                My Dashboard
              </button>
              <button
                onClick={goToProfile}
                className="block text-gray-700 py-2 w-full text-left"
              >
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="block text-red-600 py-2 w-full text-left"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}