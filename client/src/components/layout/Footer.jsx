import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Footer() {
  const [settings, setSettings] = useState({
    platformName: "",
    theme: "light",
    maintenanceMode: false,
    social: {},
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await axios.post("/api/admin/subscribe", { email });
      setEmail("");
      alert("Subscribed successfully!");
    } catch (err) {
      console.error("Subscription error:", err);
      alert("Failed to subscribe. Try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
                              <img
              src="/logo.png"
              alt="Platform Logo"
              className="h-8 w-auto mr-2"
            />
              <h1 class="text-xl font-bold text-gray-300">
                {settings.platformName?.split(" ")[0] || "Student"}
                <span className="text-brown">
                  {settings.platformName?.split(" ")[1] || "Hub"}
                </span></h1>
            </div>
            <p className="mt-4 text-gray-300">
              Empowering learners worldwide with high-quality online education.
            </p>
            <div className="mt-2 flex space-x-4">
              <a
                href={settings.social?.facebook || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <i className="fab fa-facebook-f" />
              </a>
              <a
                href={settings.social?.twitter || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <i className="fab fa-twitter" />
              </a>
              <a
                href={settings.social?.instagram || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <i className="fab fa-instagram" />
              </a>
              <a
                href={settings.social?.linkedin || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <i className="fab fa-linkedin-in" />
              </a>
            </div>

          </div>

          <div>
            <h3 className="text-lg font-semibold">Courses</h3>
            <ul className="mt-4 space-y-2">
              <li><Link className="text-gray-300 hover:text-white" to="/courses?category=Development&page=1">Development</Link></li>
              <li><Link className="text-gray-300 hover:text-white" to="/courses?category=Design&page=1">Design</Link></li>
              <li><Link className="text-gray-300 hover:text-white" to="/courses?category=Business&page=1">Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link className="text-gray-300 hover:text-white" to="/about">About</Link></li>
              <li><Link className="text-gray-300 hover:text-white" to="/careers">Careers</Link></li>
              <li><Link className="text-gray-300 hover:text-white" to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Subscribe</h3>
            <p className="mt-4 text-gray-300">
              Get the latest updates and course recommendations.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 w-full rounded-l-md text-gray-800 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-brown px-4 py-2 rounded-r-md font-medium"
              >
                {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {settings.platformName?.split(" ")[0] || "Student"}<span>{settings.platformName?.split(" ")[1] || "Hub"}</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}