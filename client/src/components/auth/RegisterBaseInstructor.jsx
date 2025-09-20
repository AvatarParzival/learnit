import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterBaseInstructor({
  apiPath = "/auth/register",
  onSuccessRedirect = "/login/instructor",
}) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [phone, setPhone] = useState("");
  const [expertise, setExpertise] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [fileLabel, setFileLabel] = useState("Choose a file");

  const [accept, setAccept] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validEmail = /^\S+@\S+\.\S+$/.test(email);
  const validPwd = password.length >= 6;
  const validBio = bio.trim().length >= 30;
  const canSubmit = name && validEmail && validPwd && expertise && validBio && accept && !submitting;

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setProfilePic(f || null);
    setFileLabel(f ? f.name : "Choose a file");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please complete all required fields. Bio should be at least 30 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("role", "instructor");
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      if (phone) fd.append("phone", phone);
      fd.append("expertise", expertise);
      fd.append("experienceYears", experienceYears);
      if (headline) fd.append("headline", headline);
      fd.append("bio", bio);
      if (linkedin) fd.append("linkedin", linkedin);
      if (website) fd.append("website", website);
      if (profilePic) fd.append("profilePic", profilePic);

      const res = await fetch(apiPath, { method: "POST", body: fd });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || text || "Registration failed";
        throw new Error(msg);
      }

      toast.success("Instructor registration successful");
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
            <i className="fas fa-chalkboard-teacher text-5xl text-primary mb-3" />
            <h2 className="text-2xl font-bold text-gray-800">Instructor Registration</h2>
            <p className="text-gray-600">Tell learners who you are and what you teach.</p>
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
                <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                  Phone Number (optional)
                </label>
                <input
                  id="phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="+966 5X XXX XXXX" autoComplete="tel"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="expertise">
                  Primary Expertise <span className="text-red-500">*</span>
                </label>
                <select
                  id="expertise" value={expertise} onChange={(e)=>setExpertise(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required
                >
                  <option value="">Select a category</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Music">Music</option>
                </select>
              </div>
<div>
  <label className="block text-gray-700 font-medium mb-2" htmlFor="experienceYears">
    Years of Experience <span className="text-red-500">*</span>
  </label>
  <input
    id="experienceYears"
    type="number"
    min="0"
    value={experienceYears}
    onChange={(e) => setExperienceYears(e.target.value)}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
    placeholder="e.g., 5"
    required
  />
</div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="headline">
                  Headline (short tagline)
                </label>
                <input
                  id="headline" type="text" value={headline} onChange={(e)=>setHeadline(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="e.g., Senior Web Developer & Mentor"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="bio">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio" value={bio} onChange={(e)=>setBio(e.target.value)}
                  className="w-full min-h-[120px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Tell learners about your experience, teaching style, and what they will learn."
                />
                <div className={`text-sm mt-1 ${validBio || !bio ? "text-gray-500" : "text-red-600"}`}>
                  {bio.length}/500 {bio.length < 30 && "(min 30 chars recommended)"}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="linkedin">
                  LinkedIn (optional)
                </label>
                <input
                  id="linkedin" type="url" value={linkedin} onChange={(e)=>setLinkedin(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="https://www.linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="website">
                  Website / Portfolio (optional)
                </label>
                <input
                  id="website" type="url" value={website} onChange={(e)=>setWebsite(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="https://your-site.com"
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

            <div className="flex items-center gap-2">
              <input
                id="accept" type="checkbox" checked={accept} onChange={(e)=>setAccept(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="accept" className="text-sm text-gray-700">
                I agree to the <a href="/terms" className="text-primary hover:underline">Terms and Privacy Policy</a>
              </label>
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
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Registering…" : "Register as Instructor"}
              </button>
            </div>

            <div className="text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <a href="/login/instructor" className="text-primary hover:underline">Log in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}