import {useState, useEffect} from "react";
import type {WorkoutSession} from "../types";
import {getSessions, deleteSession} from "../api/workouts";
import Swal from "sweetalert2";

export function useSessions() {
  const fetchSessions = () => {
    setLoading(true);
    getSessions()
      .then((data) =>
        setSessions(data.sort((a, b) => b.date.localeCompare(a.date))),
      )
      .finally(() => setLoading(false));
  };
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You Will not restore this session again",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        await deleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));

        Swal.fire({
          title: "Deleted",
          text: "Session deleted successfully",
          icon: "success",
          timer: 1000,
          showCancelButton: false,
        });
      } catch {
        Swal.fire({
          title: "Excuse me",
          text: "Error occurred during delete",
          icon: "error",
          showCancelButton: true,
        });
      }
    }
  }

  return {sessions, loading, handleDelete, fetchSessions};
}
