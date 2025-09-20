import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginChooser from "./components/auth/LoginChooser";
import RegisterChooser from "./components/auth/RegisterChooser";
import Layout from "./components/layout/Layout";
import Home from "./pages/home";
import Catalog from "./pages/catalog";
import AdminSignup from "./components/AdminSignup";
import Instructors from "./pages/Instructors";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Instructorinfo from "./pages/Instructorinfo";
import Terms from "./pages/Terms";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";
import InstructorRegistration from "./components/InstructorRegistration";
import InstructorLogin from "./components/InstructorLogin";
import AdminLogin from "./components/AdminLogin";
import StudentDashboard from "./components/StudentDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import CourseDetail from "./pages/CourseDetail";
import InstructorProfile from "./pages/InstructorProfile";
import StudentProfile from "./pages/StudentProfile";
import CourseEditor from "./pages/CourseEditor";
import CourseLearn from "./components/CourseLearn";
import ScrollToTop from "./components/ScrollToTop";

export default function App(){
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Catalog />} />
          <Route path="/login" element={<LoginChooser />} />
          <Route path="/login/student" element={<LoginForm />} />
          <Route path="/login/instructor" element={<InstructorLogin />} />
          <Route path="/register" element={<RegisterChooser />} />
          <Route path="/register/student" element={<RegistrationForm />} />
          <Route path="/register/instructor" element={<InstructorRegistration />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/register/admin" element={<AdminSignup />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/instructor-profile" element={<InstructorProfile />} />
          <Route path="/student-profile" element={<StudentProfile />} />
          <Route path="/CourseDetail" element={<CourseDetail />} />
          <Route path="/course/:id/learn" element={<CourseLearn />} /> 
          <Route path="/instructor/courses/new" element={<CourseEditor />} />
          <Route path="/instructor/courses/:id/edit" element={<CourseEditor />} />
          <Route path="/instructor/:id" element={<Instructorinfo />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="*" element={<div className="py-12">Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}