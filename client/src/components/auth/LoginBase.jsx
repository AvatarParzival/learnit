import React, { useState } from "react";
import { toast } from "react-toastify";

export default function LoginBase({
  role = "student",
  apiPath = "/auth/login",
  onSuccessRedirect = "/",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [caps, setCaps] = useState(false);

  const nice = role.charAt(0).toUpperCase() + role.slice(1);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || text || "Login failed";
        throw new Error(msg);
      }

      const token = data?.token || data?.accessToken;
      if (token) localStorage.setItem("authToken", token);
      if (data?.user?.name) localStorage.setItem("name", data.user.name);
      if (data?.user?.avatarUrl) localStorage.setItem("avatarUrl", data.user.avatarUrl);
      if (data?.user?.role) localStorage.setItem("role", data.user.role);
      else localStorage.setItem("role", role);

      toast.success(`${nice} login successful`);
      window.location.assign(onSuccessRedirect);
    } catch (err) {
      setError(err.message || "Login failed");
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-4">
            </div>

          <div className="text-center mb-6">
            <i className={`mb-3 text-5xl ${
              role === "instructor"
                ? "fas fa-chalkboard-teacher text-primary"
                : "fas fa-user-graduate text-primary"
            }`} />
            <h2 className="text-2xl font-bold text-gray-800">{nice} Login</h2>
            <p className="text-gray-600">Access your {role} dashboard</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block">{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState("CapsLock"))}
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto px-2 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  <i className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              {caps && <div className="text-sm text-red-600 mt-1">Caps Lock is on</div>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-brown flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2" />
                    Login
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            {role === "student" ? (
              <>
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <a href="/register" className="text-primary hover:underline">Register here</a>
                </p>
                <p className="text-gray-600 mt-2">
                  Instructor?{" "}
                  <a href="/login/instructor" className="text-primary hover:underline">Instructor login</a>
                </p>
              </>
            ) : (
              <p className="text-gray-600">
                Not an instructor?{" "}
                <a href="/login/student" className="text-primary hover:underline">Student login</a>
              </p>
            )}

            
          </div>
        </div>
      </div>
    </div>
  );
}