import {useState, useEffect} from "react";
import {
  getHeatmapData,
  getExercises,
  getExerciseProgress,
} from "../api/workouts";
import type {Exercise, ExerciseProgress} from "../types";

export function useAnalytics() {
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [progressData, setProgressData] = useState<ExerciseProgress[]>([]);
  const [loading, setLoading] = useState({heatmap: true, chart: false});

  // Load initial data (Heatmap & Exercises list)
  useEffect(() => {
    let mounted = true;

    Promise.all([getHeatmapData(), getExercises()])
      .then(([hData, exData]) => {
        if (!mounted) return;
        setHeatmapData(hData);
        setExercises(exData);
        if (exData.length > 0) setSelectedExercise(exData[0].id);
      })
      .catch((err) => console.error("Analytics Load Error:", err))
      .finally(() => {
        if (mounted) setLoading((prev) => ({...prev, heatmap: false}));
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Load progress data when exercise changes
  useEffect(() => {
    if (!selectedExercise) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading((prev) => ({...prev, chart: true}));

    getExerciseProgress(selectedExercise)
      .then(setProgressData)
      .catch((err) => console.error("Chart Load Error:", err))
      .finally(() => setLoading((prev) => ({...prev, chart: false})));
  }, [selectedExercise]);

  return {
    heatmapData,
    exercises,
    selectedExercise,
    setSelectedExercise,
    progressData,
    loading,
  };
}
