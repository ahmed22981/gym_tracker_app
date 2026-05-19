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
