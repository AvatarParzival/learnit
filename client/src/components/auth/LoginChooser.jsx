import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginChooser() {
  const navigate = useNavigate();
  const Card = ({ icon, title, desc, onClick, accent }) => (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left bg-white rounded-xl shadow-md border border-gray-100 p-6 transition
                  hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 
                  focus-visible:ring-blue-400`}
      aria-label={`Continue to ${title} login`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-xl grid place-items-center text-white ${accent}`}
        >
          <i className={icon} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
      </div>

      <div className="mt-4">
        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-white ${accent} transition group-hover:brightness-110`}>
          Continue
          <i className="fas fa-arrow-right ml-2 text-sm" />
        </span>
      </div>
    </button>
  );

  return (
    <div className="min-h-[70vh] bg-blue-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Choose how you want to sign in</h1>
          <p className="text-gray-600 mt-1">Select your role to continue to the correct portal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            icon="fas fa-user-graduate text-2xl"
            title="I'm a Student"
            desc="Access your courses, progress, and certificates."
            onClick={() => navigate("/login/student")}
            accent="bg-primary"
          />

          <Card
            icon="fas fa-chalkboard-teacher text-2xl"
            title="I'm an Instructor"
            desc="Manage your courses, content, and learners."
            onClick={() => navigate("/login/instructor")}
            accent="bg-primary"
          />
        </div>
      </div>
    </div>
  );
}