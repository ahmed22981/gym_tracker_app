import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {getExercises, createTemplate} from "../api/workouts";
import type {Exercise} from "../types";

export function useNewTemplate() {
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load all available exercises when the page opens
  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch((err) => console.error("Failed to fetch exercises", err));
  }, []);

  const toggleExercise = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!name.trim() || selectedIds.length === 0) return;
    setLoading(true);
    try {
      await createTemplate({
        name: name.trim(),
        exercise_ids: selectedIds, // Send the selected exercises in order
      });
      navigate("/sessions/new"); // Go back to the session select screen
    } catch (err) {
      console.error("Failed to create template", err);
      alert("Error saving routine.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return {
    name,
    setName,
    exercises,
    selectedIds,
    loading,
    toggleExercise,
    handleSave,
    handleCancel,
  };
}
