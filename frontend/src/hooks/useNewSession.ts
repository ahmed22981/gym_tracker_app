import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
  createSession,
  getTemplates,
  startTemplateSession,
} from "../api/workouts";
import type {RoutineTemplate} from "../types";

export const QUICK_NAMES = [
  "Push Day",
  "Pull Day",
  "Leg Day",
  "Upper Body",
  "Full Body",
  "Chest & Triceps",
  "Back & Biceps",
  "Shoulders",
  "Arms",
  "Cardio",
];

export function useNewSession() {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  // Template state
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch((err) => console.error("Failed to load templates", err))
      .finally(() => setLoadingTemplates(false));
  }, []);

  async function handleCreateEmpty() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const session = await createSession({name: name.trim()});
      navigate(`/sessions/${session.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleStartFromTemplate(templateId: string) {
    setStartingTemplateId(templateId);
    try {
      const session = await startTemplateSession(templateId);
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      console.error("Failed to start template session", err);
      alert("Something went wrong starting this routine.");
      setStartingTemplateId(null);
    }
  }

  return {
    name,
    setName,
    creating,
    templates,
    loadingTemplates,
    startingTemplateId,
    handleCreateEmpty,
    handleStartFromTemplate,
  };
}
