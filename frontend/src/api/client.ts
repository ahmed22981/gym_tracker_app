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
  UserProfile,
  UpdateProfilePayload,
  CustomMeal,
  CreateCustomMealPayload,
  DailyFoodLog,
  CreateFoodLogPayload,
  DailyNutritionSummary,
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!navigator.onLine || !error.response) {
      return Promise.reject(error);
    }

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (refreshError: any) {
          if (!navigator.onLine || !refreshError.response) {
            console.warn(
              "Network error during token refresh. Keeping tokens for offline use.",
            );
            return Promise.reject(refreshError);
          }

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
const QUEUE_KEY = "gym_offline_queue";

const saveToOfflineQueue = (requestConfig: {
  url: string;
  method: string;
  data: unknown;
}) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  queue.push(requestConfig);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  console.log("Saved to offline queue!", requestConfig);
};

export const processOfflineQueue = async () => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} offline requests to server...`);
  localStorage.setItem(QUEUE_KEY, "[]");

  for (const req of queue) {
    try {
      await api({url: req.url, method: req.method, data: req.data});
      console.log(`Synced successfully: ${req.url}`);
    } catch (error) {
      console.error("Failed to sync queued request:", error);
      saveToOfflineQueue(req);
    }
  }
};

window.addEventListener("online", () => {
  console.log("Network is back! Processing queue...");
  processOfflineQueue();
});

processOfflineQueue();

// --- Auth & GET Requests ---
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

export const completeOnboarding = () =>
  api.patch("/users/onboarding/").then((r) => r.data);

export async function getExerciseProgress(
  id: string,
): Promise<ExerciseProgress[]> {
  const response = await api.get(`/exercises/${id}/progress/`);
  return response.data;
}

// --- POST/PUT Requests (With Custom Offline Write capability) ---

export const createExercise = async (data: FormData) => {
  if (!navigator.onLine) throw new Error("Cannot upload image while offline.");
  const r = await api.post<Exercise>("/exercises/", data, {
    headers: {"Content-Type": "multipart/form-data"},
  });
  return r.data;
};

export const createSession = async (data: CreateSessionPayload) => {
  try {
    const r = await api.post<WorkoutSession>("/sessions/", data);
    return r.data;
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
    const r = await api.post<WorkoutLog>("/logs/", data);
    return r.data;
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
    const r = await api.patch<WorkoutLog>(`/logs/${id}/`, data);
    return r.data;
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
    const r = await api.post<RoutineTemplate>("/templates/", data);
    return r.data;
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
    const r = await api.post<WorkoutSession>(`/templates/${id}/start/`);
    return r.data;
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

export const getUserProfile = () =>
  api.get<UserProfile>("/users/profile/").then((r) => r.data);

export const updateUserProfile = (data: UpdateProfilePayload) =>
  api.patch<UserProfile>("/users/profile/", data).then((r) => r.data);

// --- Nutrition & Food Tracking Requests ---

export const getCustomMeals = () =>
  api.get<CustomMeal[]>("/nutrition/custom-meals/").then((r) => r.data);

export const createCustomMeal = (data: CreateCustomMealPayload) =>
  api.post<CustomMeal>("/nutrition/custom-meals/", data).then((r) => r.data);

export const deleteCustomMeal = (id: string) =>
  api.delete(`/nutrition/custom-meals/${id}/`).then((r) => r.data);

export const getDailyFoodLogs = (date: string) =>
  api.get<DailyFoodLog[]>(`/nutrition/logs/?date=${date}`).then((r) => r.data);

export const createDailyFoodLog = (data: CreateFoodLogPayload) =>
  api.post<DailyFoodLog>("/nutrition/logs/", data).then((r) => r.data);

export const deleteDailyFoodLog = (id: string) =>
  api.delete(`/nutrition/logs/${id}/`).then((r) => r.data);

export const getDailySummary = (date: string) =>
  api
    .get<DailyNutritionSummary>(`/nutrition/summary/?date=${date}`)
    .then((r) => r.data);
