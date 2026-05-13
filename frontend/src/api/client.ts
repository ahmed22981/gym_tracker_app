import axios from "axios";
import type {
  Exercise,
  WorkoutSession,
  WorkoutLog,
  CreateSessionPayload,
  CreateLogPayload,
  UpdateLogPayload,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {"Content-Type": "application/json"},
});

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Endpoints
export const login = (data: unknown) =>
  api.post("/token/", data).then((r) => r.data);

export const register = (data: unknown) =>
  api.post("/register/", data).then((r) => r.data);

export const googleLogin = (token: string) =>
  api.post("/google/", {token}).then((r) => r.data);

// Exercises
export const getExercises = () =>
  api.get<Exercise[]>("/exercises/").then((r) => r.data);

export const getExercise = (id: string) =>
  api.get<Exercise>(`/exercises/${id}/`).then((r) => r.data);

export const createExercise = (data: Omit<Exercise, "id" | "created_at">) =>
  api.post<Exercise>("/exercises/", data).then((r) => r.data);

export const deleteExercise = (id: string) =>
  api.delete(`/exercises/${id}/`).then((r) => r.data);

// Sessions
export const getSessions = () =>
  api.get<WorkoutSession[]>("/sessions/").then((r) => r.data);

export const getSession = (id: string) =>
  api.get<WorkoutSession>(`/sessions/${id}/`).then((r) => r.data);

export const createSession = (data: CreateSessionPayload) =>
  api.post<WorkoutSession>("/sessions/", data).then((r) => r.data);

export const deleteSession = (id: string) =>
  api.delete(`/sessions/${id}/`).then((r) => r.data);

// Logs
export const createLog = (data: CreateLogPayload) =>
  api.post<WorkoutLog>("/logs/", data).then((r) => r.data);

export const updateLog = (id: string, data: UpdateLogPayload) =>
  api.patch<WorkoutLog>(`/logs/${id}/`, data).then((r) => r.data);

export const deleteLog = (id: string) =>
  api.delete(`/logs/${id}/`).then((r) => r.data);
