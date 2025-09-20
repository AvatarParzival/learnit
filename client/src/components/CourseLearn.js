import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

export default function CourseLearn() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get(`${API_BASE}/api/courses/${id}/learn`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setCourse(data);

        const zoom = (data.zoomSchedule || []).map((m) => ({
          ...m,
          start: new Date(m.start),
          end: new Date(m.end),
          link: m.link || data.zoomLink,
          type: "zoom",
        }));

        const classroom = (data.classroomSchedule || []).map((a) => ({
          ...a,
          start: new Date(a.start),
          end: new Date(a.end),
          link: a.link || data.classroomLink,
          type: "classroom",
        }));

        setEvents([...zoom, ...classroom]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Could not load course details");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!course) return <div className="p-8">Course not found</div>;

  const { title, description, instructor, thumbnail } = course;

  const eventPropGetter = (event) => {
    const bg =
      event.type === "zoom" ? "#2563eb" : event.type === "classroom" ? "#dc2626" : "#6b7280";
    return {
      style: {
        backgroundColor: bg,
        borderRadius: "6px",
        color: "white",
        padding: "2px 6px",
      },
    };
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <img
            src={
              thumbnail
                ? `${API_BASE}${thumbnail}`
                : "https://via.placeholder.com/800x400"
            }
            alt={title}
            className="w-full h-64 object-cover rounded mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex items-center">
            <img
              src={
                instructor?.avatarUrl
                  ? `${API_BASE}${instructor.avatarUrl}`
                  : "https://via.placeholder.com/40"
              }
              alt={instructor?.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="text-gray-700 font-medium">
              Instructor: {instructor?.name}
            </span>
          </div>
        </div>
      <div class="bg-white rounded-lg shadow mb-8">
        <div className="flex space-x-4 border-b">
          {["info", "schedule"].map((tab) => (
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
              {tab === "schedule" && "Schedule"}
            </button>
          ))}
        </div>

        {activeTab === "info" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700">{description}</p>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Schedule</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  titleAccessor="title"
                  style={{ height: 600, width : '100%'}}
                  eventPropGetter={eventPropGetter}
                  onSelectEvent={(event) => {
                    if (event.link) {
                      window.open(event.link, "_blank");
                    }
                  }}
                />
              </div>

      <div className="border rounded-lg p-4 h-[600px] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
        {events.length === 0 && (
          <p className="text-gray-500 text-sm">No scheduled events.</p>
        )}
        <ul className="space-y-3 text-sm">
          {events.map((ev, i) => (
            <li
              key={i}
              className="p-3 rounded-md border hover:bg-gray-50 transition"
            >
              <span
                className={`block font-medium ${
                  ev.type === "zoom" ? "text-blue-600" : "text-red-600"
                }`}
              >
                {ev.title}
              </span>
              <span className="text-gray-600 text-xs">
                {new Date(ev.start).toLocaleString()}
              </span>
              {ev.link && (
                <a
                  href={ev.link}
                  target="_blank"
                  rel="noreferrer"
                  className={`block mt-1 text-xs underline ${
                    ev.type === "zoom" ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {ev.type === "zoom" ? "Join Meeting" : "Open Assignment"}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}
</div>
      </div>
    </div>
  );
}