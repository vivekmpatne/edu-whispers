import axios from "axios";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty";
};

export type ProfileForm = {
  attendance: number;
  assignmentCompletion: number;
  quizAverage: number;
  internalAssessment: number;
  studyHoursPerWeek: number;
  previousCgpa: number;
};

// Same-origin: the former Express API now lives at /api/* in this app.
export const api = axios.create({ baseURL: "" });

export function getStoredToken() {
  return localStorage.getItem("explainedu-token");
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem("explainedu-token", token);
  else localStorage.removeItem("explainedu-token");
}
