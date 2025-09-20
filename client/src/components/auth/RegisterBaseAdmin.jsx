import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterBaseAdmin({
  apiPath = "/auth/register-admin",
  onSuccessRedirect = "/login/admin",
}) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [inviteCode, setInviteCode] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [fileLabel, setFileLabel] = useState("Choose a file");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validEmail = /^\S+@\S+\.\S+$/.test(email);
  const validPwd = password.length >= 6;
  const pwdMatch = password === confirm;
  const hasInvite = inviteCode.trim().length > 0;

  const canSubmit = name && validEmail && validPwd && pwdMatch && hasInvite && !submitting;

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setProfilePic(f || null);
    setFileLabel(f ? f.name : "Choose a file");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please complete all required fields (valid email, matching passwords, invite code).");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("role", "admin");
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("inviteCode", inviteCode);
      if (organization) fd.append("organization", organization);
      if (phone) fd.append("phone", phone);
      if (profilePic) fd.append("profilePic", profilePic);

      const res = await fetch(apiPath, { method: "POST", body: fd });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || text || "Registration failed";
        throw new Error(msg);
      }

      toast.success("Admin registration successful");
      navigate(onSuccessRedirect);
    } catch (err) {
      setError(err.message || "Registration failed");
      toast.error(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] py-12 px-4 flex items-center justify-center bg-blue-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <i className="fas fa-user-shield text-5xl text-gray-800 mb-3" />
            <h2 className="text-2xl font-bold text-gray-800">Admin Registration</h2>
            <p className="text-gray-600">Create an administrator account for your organization.</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block">{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name" type="text" value={name} onChange={(e)=>setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required autoComplete="email"
                />
                {!validEmail && email && (
                  <p className="text-sm text-red-600 mt-1">Enter a valid email address.</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password" type={showPwd ? "text" : "password"} value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="••••••••" autoComplete="new-password" required
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
                {!validPwd && password && (
                  <p className="text-sm text-red-600 mt-1">Minimum 6 characters.</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="confirm">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirm" type={showPwd ? "text" : "password"} value={confirm}
                  onChange={(e)=>setConfirm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="••••••••" autoComplete="new-password" required
                />
                {!pwdMatch && confirm && (
                  <p className="text-sm text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="invite">
                  Admin Access Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="invite" type="text" value={inviteCode} onChange={(e)=>setInviteCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter your organization’s admin invite code"
                  required
                />
                {!hasInvite && (
                  <p className="text-sm text-red-600 mt-1">An invite code is required.</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="org">
                  Organization (optional)
                </label>
                <input
                  id="org" type="text" value={organization} onChange={(e)=>setOrganization(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="School / Company"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                  Phone Number (optional)
                </label>
                <input
                  id="phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="+966 5X XXX XXXX" autoComplete="tel"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="profilePic">
                  Profile Picture (optional)
                </label>
                <label className="flex items-center justify-between w-full px-4 py-2 border rounded-lg cursor-pointer">
                  <span className="flex items-center">
                    <i className="fas fa-upload mr-2 text-gray-500" />
                    <span>{fileLabel}</span>
                  </span>
                  <input
                    id="profilePic" type="file" accept="image/*" className="hidden"
                    onChange={onFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button" onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={!canSubmit}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Registering…" : "Register as Admin"}
              </button>
            </div>

            <div className="text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <a href="/login/admin" className="text-primary hover:underline">Log in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}