import { api } from "./client";
import type { UserProfile, UpdateProfilePayload } from "../types";

export const login = (data: unknown) => api.post("/token/", data).then((r) => r.data);
export const register = (data: unknown) => api.post("/register/", data).then((r) => r.data);
export const googleLogin = (token: string) => api.post("/google/", { token }).then((r) => r.data);

export const getUserProfile = () => api.get<UserProfile>("/users/profile/").then((r) => r.data);
export const updateUserProfile = (data: UpdateProfilePayload) =>
  api.patch<UserProfile>("/users/profile/", data).then((r) => r.data);
export const completeOnboarding = () => api.patch("/users/onboarding/").then((r) => r.data);