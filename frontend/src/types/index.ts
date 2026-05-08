export interface Exercise {
  id: string;
  name: string;
  target_muscle: string;
  video_url: string | null;
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
