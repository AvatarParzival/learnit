import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterChooser() {
  const navigate = useNavigate();

  const Card = ({ icon, title, desc, to, accent }) => (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`group w-full text-left bg-white rounded-xl shadow-md border border-gray-100 p-6 transition
                  hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 
                  focus-visible:ring-blue-400 flex flex-col h-full`}
      aria-label={`Continue to ${title} registration`}
    >
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl grid place-items-center text-white ${accent}`}>
          <i className={icon} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-white ${accent} transition group-hover:brightness-110`}>
          Continue <i className="fas fa-arrow-right ml-2 text-sm" />
        </span>
      </div>
    </button>
  );

  return (
    <div className="min-h-[70vh] bg-blue-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-1">Pick the role you want to register as.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Card
            icon="fas fa-user-graduate text-2xl"
            title="I'm a Student"
            desc="Learn from courses and track your progress."
            to="/register/student"
            accent="bg-primary"
          />
          <Card
            icon="fas fa-chalkboard-teacher text-2xl"
            title="I'm an Instructor"
            desc="Publish and manage your courses."
            to="/register/instructor"
            accent="bg-primary"
          />
        </div>
      </div>
    </div>
  );
}