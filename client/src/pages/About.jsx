import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const About = () => {
  const [settings, setSettings] = useState({
    platformName: "",
    theme: "light",
    maintenanceMode: false,
    social: {},
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          About {settings.platformName?.split(" ")[0] || "Student"}
          <span>{settings.platformName?.split(" ")[1] || "Hub"}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We believe knowledge should have no borders.{" "}
          {settings.platformName?.split(" ")[0] || "Student"}
          <span>{settings.platformName?.split(" ")[1] || "Hub"}</span> empowers
          anyone, anywhere to master new skills on their own terms.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            Our mission is to democratize education by making high-quality
            learning experiences accessible, affordable, and enjoyable.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>
              <i className="fas fa-check-circle text-primary mr-2" />
              Expert-led courses
            </li>
            <li>
              <i className="fas fa-check-circle text-primary mr-2" />
              Anytime, anywhere
            </li>
            <li>
              <i className="fas fa-check-circle text-primary mr-2" />
              Career-ready skills
            </li>
          </ul>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60"
            alt="Team"
            className="rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
        {[
          { num: "5M+", label: "Students" },
          { num: "1,200+", label: "Courses" },
          { num: "300+", label: "Expert Instructors" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow p-6">
            <p className="text-3xl font-bold text-primary">{s.num}</p>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/courses"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          Start Learning
        </Link>
      </div>
    </div>
  );
};

export default About;