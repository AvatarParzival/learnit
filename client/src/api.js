import axios from "axios";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

export const enrollInCourse = (courseId, token) =>
  api.post(`/api/courses/${courseId}/enroll`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const unenrollFromCourse = (courseId, token) =>
  api.delete(`/api/courses/${courseId}/unenroll`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getMyEnrolledCourses = (token) =>
  api.get("/api/courses/enrolled/my-courses", {
    headers: { Authorization: `Bearer ${token}` }
  });

export default api;