import {api} from "./client";
import type {
  CustomMeal,
  CreateCustomMealPayload,
  DailyFoodLog,
  CreateFoodLogPayload,
  DailyNutritionSummary,
  AIMealPlan,
} from "../types";

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
export const generateAIMealPlan = () =>
  api.get<AIMealPlan>("/nutrition/generate-ai-plan/").then((r) => r.data);
export const saveAIMealPlan = (data: {date: string; meals: unknown[]}) =>
  api.post("/nutrition/save-ai-plan/", data).then((r) => r.data);
