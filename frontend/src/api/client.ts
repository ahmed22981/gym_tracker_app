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
