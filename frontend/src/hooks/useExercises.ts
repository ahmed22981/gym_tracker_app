import {useState, useEffect} from "react";
import {getExercises, createExercise} from "../api/workouts";
import type {Exercise} from "../types";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [targetMuscle, setTargetMuscle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getExercises()
      .then(setExercises)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("target_muscle", targetMuscle.trim());
      if (videoUrl.trim()) formData.append("video_url", videoUrl.trim());
      if (videoFile) formData.append("video_file", videoFile);

      const ex = await createExercise(formData);
      setExercises((prev) => [ex, ...prev]);

      // Reset form
      setName("");
      setTargetMuscle("");
      setVideoUrl("");
      setVideoFile(null);
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  }

  const handleDelete = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleForm = () => setShowForm((p) => !p);

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.target_muscle.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    exercises,
    filteredExercises,
    loading,
    showForm,
    setShowForm,
    toggleForm,
    search,
    setSearch,
    name,
    setName,
    targetMuscle,
    setTargetMuscle,
    videoUrl,
    setVideoUrl,
    setVideoFile,
    creating,
    handleCreate,
    handleDelete,
  };
}
