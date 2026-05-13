import axios from "axios";
import type {
  Exercise,
  WorkoutSession,
  WorkoutLog,
  CreateSessionPayload,
  CreateLogPayload,
  UpdateLogPayload,
  RoutineTemplate,
  CreateTemplatePayload,
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

// Response Interceptor (Refresh Token)
api.interceptors.request.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Grap the original request
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Trying to prevent infinite loop
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/token/refresh`,
            {refresh: refreshToken},
          );
          const newAccessToken = response.data.access;
          localStorage.setItem("access_storage", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.warn("Refresh token expires, Logging out");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

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

// Templates
export const getTemplates = () =>
  api.get<RoutineTemplate[]>("/templates/").then((r) => r.data);

export const getTemplate = (id: string) =>
  api.get<RoutineTemplate>(`/templates/${id}/`).then((r) => r.data);

export const createTemplate = (data: CreateTemplatePayload) =>
  api.post<RoutineTemplate>("/templates/", data).then((r) => r.data);

export const deleteTemplate = (id: string) =>
  api.delete(`/templates/${id}/`).then((r) => r.data);

export const startTemplateSession = (id: string) =>
  api.post<WorkoutSession>(`/templates/${id}/start/`).then((r) => r.data);

// Analytics
export const getHeatmapData = () =>
  api.get<Record<string, number>>("/analytics/heatmap/").then((r) => r.data);
