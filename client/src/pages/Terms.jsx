import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Term() {
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
    <div className="min-h-screen py-12">
    <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Terms and Privacy Policy</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-10">
        <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
        <ul className="space-y-1 text-blue-600">
          <li>
            <a href="#terms" className="hover:underline">
              Terms of Service
            </a>
          </li>
          <li>
            <a href="#privacy" className="hover:underline">
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>

      <section id="terms" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Terms of Service</h2>
        <p className="mb-4 text-gray-600">
          Welcome to {settings.platformName?.split(" ")[0] || "Student"}<span>{settings.platformName?.split(" ")[1] || "Hub"}</span>. By using our platform, you agree to comply with these Terms of Service.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">1. Acceptance of Terms</h3>
        <p className="mb-3 text-gray-600">
          By accessing or using {settings.platformName?.split(" ")[0] || "Student"}<span>{settings.platformName?.split(" ")[1] || "Hub"}</span>, you agree to be bound by these Terms and our Privacy Policy.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">2. User Responsibilities</h3>
        <p className="mb-3 text-gray-600">
          You are responsible for maintaining the confidentiality of your account and ensuring lawful usage of our services.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3. Courses and Content</h3>
        <p className="mb-3 text-gray-600">
          All content, including courses and materials, is owned by StudentHub or respective instructors.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4. Termination</h3>
        <p className="mb-3 text-gray-600">
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      <section id="privacy">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Privacy Policy</h2>
        <p className="mb-4 text-gray-600">
          At {settings.platformName?.split(" ")[0] || "Student"}<span>{settings.platformName?.split(" ")[1] || "Hub"}</span>, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your data.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">1. Information We Collect</h3>
        <p className="mb-3 text-gray-600">
          We collect personal details such as name, email, and usage data when you register or use our platform.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">2. How We Use Data</h3>
        <p className="mb-3 text-gray-600">
          Your information helps us provide courses, send updates, and improve our services.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3. Sharing of Data</h3>
        <p className="mb-3 text-gray-600">
          We never sell your data. Limited sharing may occur with service providers under strict confidentiality.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">4. Data Security</h3>
        <p className="mb-3 text-gray-600">
          We use encryption and best practices to protect your information.
        </p>
      </section>
    </div></div>
  );
}