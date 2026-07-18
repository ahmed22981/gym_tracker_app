import axios from "axios";

export const api = axios.create({
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
    if (!navigator.onLine || !error.response) return Promise.reject(error);

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
          if (!navigator.onLine || !refreshError.response)
            return Promise.reject(refreshError);
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

export const saveToOfflineQueue = (requestConfig: {
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
  localStorage.setItem(QUEUE_KEY, "[]");

  for (const req of queue) {
    try {
      await api({url: req.url, method: req.method, data: req.data});
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      saveToOfflineQueue(req);
    }
  }
};

window.addEventListener("online", () => {
  processOfflineQueue();
});
processOfflineQueue();
