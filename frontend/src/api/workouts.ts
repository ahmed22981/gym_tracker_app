import {api, saveToOfflineQueue} from "./client";
import type {
  Exercise,
  WorkoutSession,
  WorkoutLog,
  CreateSessionPayload,
  CreateLogPayload,
  UpdateLogPayload,
  RoutineTemplate,
  CreateTemplatePayload,
  ExerciseProgress,
} from "../types";

// --- GET Requests ---
export const getExercises = () =>
  api.get<Exercise[]>("/exercises/").then((r) => r.data);
export const getExercise = (id: string) =>
  api.get<Exercise>(`/exercises/${id}/`).then((r) => r.data);
export const getSessions = () =>
  api.get<WorkoutSession[]>("/sessions/").then((r) => r.data);
export const getSession = (id: string) =>
  api.get<WorkoutSession>(`/sessions/${id}/`).then((r) => r.data);
export const getTemplates = () =>
  api.get<RoutineTemplate[]>("/templates/").then((r) => r.data);
export const getTemplate = (id: string) =>
  api.get<RoutineTemplate>(`/templates/${id}/`).then((r) => r.data);
export const getHeatmapData = () =>
  api.get<Record<string, number>>("/analytics/heatmap/").then((r) => r.data);
export const getExerciseProgress = (id: string) =>
  api.get<ExerciseProgress[]>(`/exercises/${id}/progress/`).then((r) => r.data);

// --- DELETE Requests ---
export const deleteExercise = (id: string) =>
  api.delete(`/exercises/${id}/`).then((r) => r.data);
export const deleteSession = (id: string) =>
  api.delete(`/sessions/${id}/`).then((r) => r.data);
export const deleteLog = (id: string) =>
  api.delete(`/logs/${id}/`).then((r) => r.data);
export const deleteTemplate = (id: string) =>
  api.delete(`/templates/${id}/`).then((r) => r.data);

// --- POST/PUT Requests (With Offline Support) ---
export const createExercise = async (data: FormData) => {
  if (!navigator.onLine) throw new Error("Cannot upload image while offline.");
  const r = await api.post<Exercise>("/exercises/", data, {
    headers: {"Content-Type": "multipart/form-data"},
  });
  return r.data;
};

export const createSession = async (data: CreateSessionPayload) => {
  try {
    return (await api.post<WorkoutSession>("/sessions/", data)).data;
  } catch (error) {
    if (!navigator.onLine) {
      saveToOfflineQueue({url: "/sessions/", method: "POST", data});
      return {
        id: `temp-sess-${Date.now()}`,
        ...data,
      } as unknown as WorkoutSession;
    }
    throw error;
  }
};

export const createLog = async (data: CreateLogPayload) => {
  try {
    return (await api.post<WorkoutLog>("/logs/", data)).data;
  } catch (error) {
    if (!navigator.onLine) {
      saveToOfflineQueue({url: "/logs/", method: "POST", data});
      return {id: `temp-log-${Date.now()}`, ...data} as unknown as WorkoutLog;
    }
    throw error;
  }
};

export const updateLog = async (id: string, data: UpdateLogPayload) => {
  try {
    return (await api.patch<WorkoutLog>(`/logs/${id}/`, data)).data;
  } catch (error) {
    if (!navigator.onLine) {
      saveToOfflineQueue({url: `/logs/${id}/`, method: "PATCH", data});
      return {id, ...data} as unknown as WorkoutLog;
    }
    throw error;
  }
};

export const createTemplate = async (data: CreateTemplatePayload) => {
  try {
    return (await api.post<RoutineTemplate>("/templates/", data)).data;
  } catch (error) {
    if (!navigator.onLine) {
      saveToOfflineQueue({url: "/templates/", method: "POST", data});
      return {
        id: `temp-tpl-${Date.now()}`,
        ...data,
      } as unknown as RoutineTemplate;
    }
    throw error;
  }
};

export const startTemplateSession = async (id: string) => {
  try {
    return (await api.post<WorkoutSession>(`/templates/${id}/start/`)).data;
  } catch (error) {
    if (!navigator.onLine) {
      saveToOfflineQueue({
        url: `/templates/${id}/start/`,
        method: "POST",
        data: {},
      });
      return {id: `temp-tsess-${Date.now()}`} as unknown as WorkoutSession;
    }
    throw error;
  }
};
