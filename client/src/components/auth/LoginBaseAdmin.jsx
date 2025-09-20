import React, { useState } from "react";
import { toast } from "react-toastify";

export default function LoginBaseAdmin({
  apiPath = "/auth/login",
  onSuccessRedirect = "/AdminDashboard",
  requireAccessCode = false,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [caps, setCaps] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password || (requireAccessCode && !accessCode)) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = { email, password, role: "admin" };
      if (accessCode) payload.accessCode = accessCode;

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      localStorage.setItem("role", "admin");

      toast.success("Admin login successful");
      window.location.assign(onSuccessRedirect);
    } catch (err) {
      setError(err.message || "Login failed");
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] py-12 px-4 flex items-center justify-center bg-blue-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <i className="fas fa-user-shield text-5xl text-gray-800 mb-3" />
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-gray-600">Access the administrator dashboard</p>
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
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  onChange={(e)=>setPassword(e.target.value)}
                  onKeyUp={(e)=>setCaps(e.getModifierState && e.getModifierState("CapsLock"))}
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={()=>setShowPwd(s=>!s)}
                  className="absolute inset-y-0 right-2 my-auto px-2 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  <i className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              {caps && <div className="text-sm text-red-600 mt-1">Caps Lock is on</div>}
            </div>

            {requireAccessCode && (
              <div>
                <label htmlFor="accessCode" className="block text-gray-700 font-medium mb-2">
                  Admin Access Code
                </label>
                <input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e)=>setAccessCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter your admin code"
                  required
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <i className="fas fa-right-to-bracket mr-2" />
                    Log in as Admin
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-gray-600">
            Register Admin?{" "}
            <a href="/register/admin" className="text-primary hover:underline">Register</a>
          </div>
        </div>
      </div>
    </div>
  );
}