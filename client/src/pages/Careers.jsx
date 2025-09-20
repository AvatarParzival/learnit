import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { toast } from "react-toastify";

export default function Careers() {
  const [state, handleSubmit] = useForm("mpwjqgao");

  React.useEffect(() => {
    if (state.succeeded) {
      toast.success("Application sent! We'll be in touch.");
    }
  }, [state.succeeded]);

  React.useEffect(() => {
    if (state.errors && state.errors.length > 0) {
      toast.error("Failed to send application. Please try again.");
    }
  }, [state.errors]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Join Our Team</h1>
        <p className="text-xl text-gray-600">Help us shape the future of education.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {["Frontend Developer", "Content Creator", "Marketing Lead", "Instructor", "Product Designer", "Data Analyst"].map((role) => (
          <div key={role} className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold mb-2">{role}</h3>
            <p className="text-gray-600 mb-4">Remote • Full-time</p>
            <span className="text-sm text-primary">Scroll down to apply</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Apply Now</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>

          <div>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>

          <div>
            <input
              id="role"
              type="text"
              name="role"
              placeholder="Role / Position"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <ValidationError prefix="Role" field="role" errors={state.errors} />
          </div>

          <div>
            <input
              id="cv"
              type="file"
              name="cv"
              accept=".pdf,.doc,.docx"
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <ValidationError prefix="CV" field="cv" errors={state.errors} />
          </div>

          <button
            type="submit"
            disabled={state.submitting}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {state.submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {state.succeeded && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            <p>Thanks for your application! We'll be in touch soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}