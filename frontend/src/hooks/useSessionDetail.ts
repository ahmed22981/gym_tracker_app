import {useState, useEffect, useMemo} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {getSession} from "../api/workouts";
import type {WorkoutSession, WorkoutLog} from "../types";

export function useSessionDetail() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [preSelectedExercise, setPreSelectedExercise] = useState<
    string | undefined
  >(undefined);
  const [videoToPlay, setVideoToPlay] = useState<{
    file: string | null;
    url: string | null;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    getSession(id)
      .then((s) => {
        setSession(s);
        setLogs(s.logs.sort((a, b) => a.set_number - b.set_number));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const openModalWithExercise = (exId?: string) => {
    setPreSelectedExercise(exId);
    setShowModal(true);
  };

  const handlePlayVideo = (
    file: string | null | undefined,
    url: string | null | undefined,
  ) => {
    if (file || url) {
      setVideoToPlay({file: file || null, url: url || null});
    }
  };

  const grouped = useMemo(() => {
    return logs.reduce<Record<string, WorkoutLog[]>>((acc, log) => {
      if (!acc[log.exercise_name]) acc[log.exercise_name] = [];
      acc[log.exercise_name].push(log);
      return acc;
    }, {});
  }, [logs]);

  const totalVolume = logs.reduce((acc, l) => acc + l.reps * l.weight, 0);

  const handleLogUpdated = (updated: WorkoutLog) => {
    setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleLogDeleted = (deletedId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== deletedId));
  };

  const handleLogAdded = (log: WorkoutLog) => {
    setLogs((prev) => [...prev, log]);
    setShowModal(false);
  };

  return {
    navigate,
    session,
    logs,
    loading,
    showModal,
    setShowModal,
    preSelectedExercise,
    videoToPlay,
    setVideoToPlay,
    openModalWithExercise,
    handlePlayVideo,
    grouped,
    totalVolume,
    handleLogUpdated,
    handleLogDeleted,
    handleLogAdded,
  };
}
