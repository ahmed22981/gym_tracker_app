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
  ExerciseProgress,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {"Content-Type": "application/json"},
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/token/refresh/`,
            {refresh: refreshToken},
          );

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          console.warn("Refresh token expired, logging out");
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

// Auth & GET Requests
export const login = (data: unknown) =>
  api.post("/token/", data).then((r) => r.data);
export const register = (data: unknown) =>
  api.post("/register/", data).then((r) => r.data);
export const googleLogin = (token: string) =>
  api.post("/google/", {token}).then((r) => r.data);

export const getExercises = () =>
  api.get<Exercise[]>("/exercises/").then((r) => r.data);
export const getExercise = (id: string) =>
  api.get<Exercise>(`/exercises/${id}/`).then((r) => r.data);
export const deleteExercise = (id: string) =>
  api.delete(`/exercises/${id}/`).then((r) => r.data);

export const getSessions = () =>
  api.get<WorkoutSession[]>("/sessions/").then((r) => r.data);
export const getSession = (id: string) =>
  api.get<WorkoutSession>(`/sessions/${id}/`).then((r) => r.data);
export const deleteSession = (id: string) =>
  api.delete(`/sessions/${id}/`).then((r) => r.data);

export const deleteLog = (id: string) =>
  api.delete(`/logs/${id}/`).then((r) => r.data);

export const getTemplates = () =>
  api.get<RoutineTemplate[]>("/templates/").then((r) => r.data);
export const getTemplate = (id: string) =>
  api.get<RoutineTemplate>(`/templates/${id}/`).then((r) => r.data);
export const deleteTemplate = (id: string) =>
  api.delete(`/templates/${id}/`).then((r) => r.data);

export const getHeatmapData = () =>
  api.get<Record<string, number>>("/analytics/heatmap/").then((r) => r.data);
export async function getExerciseProgress(
  id: string,
): Promise<ExerciseProgress[]> {
  const response = await api.get(`/exercises/${id}/progress/`);
  return response.data;
}

// POST/PUT Requests (Offline Sync)

export const createExercise = async (data: FormData) => {
  try {
    const r = await api.post<Exercise>("/exercises/", data, {
      headers: {"Content-Type": "multipart/form-data"},
    });
    return r.data;
  } catch (error) {
    if (!navigator.onLine) {
      console.log("Offline: Exercise creation queued.");
      return {id: `temp-ex-${Date.now()}`} as unknown as Exercise;
    }
    throw error;
  }
};

export const createSession = async (data: CreateSessionPayload) => {
  try {
    const r = await api.post<WorkoutSession>("/sessions/", data);
    return r.data;
  } catch (error) {
    if (!navigator.onLine) {
      console.log("Offline: Session creation queued.");
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
    const r = await api.post<WorkoutLog>("/logs/", data);
    return r.data;
  } catch (error) {
    if (!navigator.onLine) {
      console.log("Offline: Log creation queued.");
      return {id: `temp-log-${Date.now()}`, ...data} as unknown as WorkoutLog;
    }
    throw error;
  }
};

export const updateLog = async (id: string, data: UpdateLogPayload) => {
  try {
    const r = await api.patch<WorkoutLog>(`/logs/${id}/`, data);
    return r.data;
  } catch (error) {
    if (!navigator.onLine) {
      console.log("Offline: Log update queued.");
      return {id, ...data} as unknown as WorkoutLog;
    }
    throw error;
  }
};

export const createTemplate = async (data: CreateTemplatePayload) => {
  try {
    const r = await api.post<RoutineTemplate>("/templates/", data);
    return r.data;
  } catch (error) {
    if (!navigator.onLine) {
      console.log("Offline: Template creation queued.");
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
    const r = await api.post<WorkoutSession>(`/templates/${id}/start/`);
    return r.data;
  } catch (error) {
    if (!navigator.onLine) {
      console.log("Offline: Template session start queued.");
      return {id: `temp-tsess-${Date.now()}`} as unknown as WorkoutSession;
    }
    throw error;
  }
};
