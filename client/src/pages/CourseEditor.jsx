import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CourseEditor() {
  const [activeTab, setActiveTab] = useState("info");
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "",
    thumbnail: null,
    zoomLink: "",
    classroomLink: "",
    zoomSchedule: [],
    classroomSchedule: [],
  });

  const [preview, setPreview] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventType, setEventType] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    link: "",
  });

  const handleDeleteEvent = (event, type) => {
    setCourse((prev) => {
      if (type === "zoom") {
        return {
          ...prev,
          zoomSchedule: prev.zoomSchedule.filter((e) => e !== event),
        };
      } else {
        return {
          ...prev,
          classroomSchedule: prev.classroomSchedule.filter((e) => e !== event),
        };
      }
    });
    toast.info(`🗑️ Deleted: ${event.title}`);
  };

  useEffect(() => {
    if (!id) return;
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${API_BASE}/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCourse({
          ...res.data,
          zoomSchedule: Array.isArray(res.data.zoomSchedule)
            ? res.data.zoomSchedule.map((e) => ({
                ...e,
                start: new Date(e.start),
                end: new Date(e.end),
              }))
            : [],
          classroomSchedule: Array.isArray(res.data.classroomSchedule)
            ? res.data.classroomSchedule.map((e) => ({
                ...e,
                start: new Date(e.start),
                end: new Date(e.end),
              }))
            : [],
        });

        if (res.data.thumbnail) {
          setPreview(`${API_BASE}${res.data.thumbnail}`);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load course for editing");
        navigate("/instructor-dashboard");
      }
    };
    fetchCourse();
  }, [id, navigate]);

  const handleSelectSlot = ({ start, end }, type) => {
    setEventType(type);
    setNewEvent({
      title:
        type === "zoom"
          ? `${course.title || "Course"} Zoom Session`
          : `${course.title || "Course"} Assignment`,
      start,
      end,
      link: "",
    });
    setShowEventModal(true);
  };

  const saveEvent = () => {
    if (eventType === "zoom") {
      setCourse((prev) => ({
        ...prev,
        zoomSchedule: [...prev.zoomSchedule, newEvent],
      }));
    } else {
      setCourse((prev) => ({
        ...prev,
        classroomSchedule: [...prev.classroomSchedule, newEvent],
      }));
    }
    setShowEventModal(false);
  };

  const handleInfoChange = (key, value) => {
    setCourse((prev) => ({ ...prev, [key]: value }));
  };

  const saveCourse = async () => {
    try {
      if (!course.thumbnail) {
        toast.error("Thumbnail is required");
        return;
      }

      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      Object.keys(course).forEach((key) => {
        if (key === "zoomSchedule" || key === "classroomSchedule") {
          formData.append(key, JSON.stringify(course[key]));
        } else if (course[key] !== null) {
          formData.append(key, course[key]);
        }
      });

      let res;
      if (id) {
        res = await axios.put(`${API_BASE}/api/courses/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.post(`${API_BASE}/api/courses`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast.success("Course saved!");
      navigate("/instructor-dashboard");
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error("Failed to save course");
    }
  };

  return (
    <div className="min-h-10 p-8">
      <div class="bg-white rounded-lg shadow mb-8">
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {["info", "zoom", "classroom"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "info" && "Information"}
              {tab === "zoom" && "Zoom Meetings"}
              {tab === "classroom" && "Google Classroom"}
            </button>
          ))}
        </div>

        {activeTab === "info" && (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <input
              type="text"
              placeholder="Course Title"
              value={course.title}
              onChange={(e) => handleInfoChange("title", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              rows={3}
              placeholder="Course Description"
              value={course.description}
              onChange={(e) => handleInfoChange("description", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={course.category}
                onChange={(e) => handleInfoChange("category", e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {[
                  "Development",
                  "Business",
                  "Finance & Accounting",
                  "IT & Software",
                  "Office Productivity",
                  "Personal Development",
                  "Design",
                  "Marketing",
                  "Lifestyle",
                  "Photography & Video",
                  "Health & Fitness",
                  "Music",
                  "Teaching & Academics",
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={course.level}
                onChange={(e) => handleInfoChange("level", e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <input
              type="number"
              placeholder="Price (USD)"
              value={course.price}
              onChange={(e) => handleInfoChange("price", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setCourse((prev) => ({ ...prev, thumbnail: file }));
                  setPreview(file ? URL.createObjectURL(file) : null);
                }}
                className="hidden"
                id="thumbnail-upload"
              />
              <label htmlFor="thumbnail-upload" className="cursor-pointer block">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="h-40 w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <i className="fas fa-upload text-2xl mb-2" />
                    <span>Click to upload thumbnail</span>
                  </div>
                )}
              </label>

              {!course.thumbnail && (
                <p className="text-red-500 text-sm mt-2">
                  Thumbnail is required
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "zoom" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Add Zoom Meetings
            </h3>
            <input
              type="url"
              placeholder="Zoom Link"
              value={course.zoomLink}
              onChange={(e) => handleInfoChange("zoomLink", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <Calendar
              localizer={localizer}
              events={course.zoomSchedule}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              selectable
              popup
              onSelectSlot={(slot) => handleSelectSlot(slot, "zoom")}
              onSelectEvent={(event) => handleDeleteEvent(event, "zoom")}
              views={["month", "week"]}
              step={30}
              defaultView="month"
              toolbar={true}
              drilldownView={null}
              longPressThreshold={1}
            />
          </div>
        )}

        {activeTab === "classroom" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Add Classroom Assignments
            </h3>
            <input
              type="url"
              placeholder="Google Classroom Link"
              value={course.classroomLink}
              onChange={(e) => handleInfoChange("classroomLink", e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <Calendar
              localizer={localizer}
              events={course.classroomSchedule}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              selectable
              onSelectSlot={(slot) => handleSelectSlot(slot, "classroom")}
              onSelectEvent={(event) => handleDeleteEvent(event, "classroom")}
              popup
              views={["month", "week"]}
              step={30}
              defaultView="month"
              toolbar={true}
              drilldownView={null}
              longPressThreshold={1}
            />
          </div>
        )}

        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {eventType === "zoom" ? "Add Zoom Meeting" : "Add Assignment"}
              </h2>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full border px-3 py-2 rounded-lg mb-3"
              />
              <input
                type="datetime-local"
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    start: new Date(e.target.value),
                  }))
                }
                className="w-full border px-3 py-2 rounded-lg mb-3"
              />
              <input
                type="datetime-local"
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    end: new Date(e.target.value),
                  }))
                }
                className="w-full border px-3 py-2 rounded-lg mb-3"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => navigate("/instructor-dashboard")}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400"
        >
          ← Back to Dashboard
        </button>

        <button
          onClick={saveCourse}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
        >
          Save Course
        </button>
      </div>
    </div>
  );
}