export interface Exercise {
  id: string;
  name: string;
  target_muscle: string;
  video_url: string | null;
  video_file: string | null;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  session: string;
  exercise: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight: number;
  created_at: string;
  video_url: string | null;
  video_file: string | null;
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  logs: WorkoutLog[];
}

export interface CreateSessionPayload {
  name: string;
}

export interface CreateLogPayload {
  session: string;
  exercise: string;
  set_number: number;
  reps: number;
  weight: number;
}

export interface UpdateLogPayload {
  reps?: number;
  weight?: number;
  set_number?: number;
}

export interface RoutineItem {
  id: string;
  template: string;
  exercise: string;
  exercise_name: string;
  order: number;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  items: RoutineItem[];
  created_at: string;
}

export interface CreateTemplatePayload {
  name: string;
  exercise_ids: string[];
}

export interface ExerciseProgress {
  date: string;
  max_weight: number;
}

export interface UserProfile {
  gender: "M" | "F" | null;
  date_of_birth: string | null; // YYYY-MM-DD
  weight_kg: number | null;
  height_cm: number | null;
  activity_level:
    | "SEDENTARY"
    | "LIGHT"
    | "MODERATE"
    | "ACTIVE"
    | "VERY_ACTIVE"
    | null;
  goal: "CUT" | "MAINTAIN" | "BULK" | null;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fats: number | null;
  has_seen_onboarding?: boolean;
}

export type UpdateProfilePayload = Partial<
  Omit<
    UserProfile,
    "target_calories" | "target_protein" | "target_carbs" | "target_fats"
  >
>;

export interface CustomMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DailyFoodLog {
  id: string;
  date: string;
  meal_name: string;
  details?: string;
  custom_meal?: string | null;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
}

export interface DailyNutritionSummary {
  date: string;
  consumed_calories: number;
  consumed_protein: number;
  consumed_carbs: number;
  consumed_fats: number;
}

export interface CreateCustomMealPayload {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface CreateFoodLogPayload {
  date: string;
  meal_name?: string;
  custom_meal?: string;
  servings: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

// AI meal plan
export interface AIMeal {
  meal_name: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface AIMealPlan {
  plan_title: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: AIMeal[];
}
