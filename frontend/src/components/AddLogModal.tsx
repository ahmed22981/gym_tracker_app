import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Exercise, WorkoutLog } from "../types";
import { getExercises, createLog } from "../api/client";
import { useTimer } from "../context/TimerContext";

interface Props {
  sessionId: string;
  currentLogs: WorkoutLog[];
  initialExerciseId?: string;
  onAdded: (log: WorkoutLog) => void;
  onClose: () => void;
}

export default function AddLogModal({ sessionId, currentLogs, initialExerciseId, onAdded, onClose }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState(initialExerciseId || "");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("20");
  const [saving, setSaving] = useState(false);
  
  const { startTimer } = useTimer();

  const currentSessionExerciseIds = new Set(currentLogs.map(l => l.exercise));
  
  const sessionExercises = exercises.filter(ex => currentSessionExerciseIds.has(ex.id));
  const otherExercises = exercises.filter(ex => !currentSessionExerciseIds.has(ex.id));

  useEffect(() => { 
    getExercises().then(setExercises);
  }, []);

  useEffect(() => {
    if (!exerciseId) return;
    const prev = currentLogs
      .filter((l) => l.exercise === exerciseId)
      .sort((a, b) => b.set_number - a.set_number);
    if (prev.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReps(String(prev[0].reps));
      setWeight(String(prev[0].weight));
    }
  }, [exerciseId, currentLogs]);

  const nextSet = exerciseId
    ? currentLogs.filter((l) => l.exercise === exerciseId).length + 1
    : 1;

  async function handleSubmit() {
    if (!exerciseId) return;
    setSaving(true);
    try {
      const log = await createLog({
        session: sessionId, 
        exercise: exerciseId,
        set_number: nextSet, 
        reps: Number(reps), 
        weight: Number(weight),
      });
      onAdded(log);
      startTimer(90);
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: 520,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px 16px 0 0",
        padding: "24px 20px",
        paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        position: "relative",
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "var(--border)", margin: "0 auto 20px",
        }} />

        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20,
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", display: "flex",
        }}>
          <X size={18} />
        </button>

        <div className="font-display" style={{ fontSize: 24, marginBottom: 20 }}>LOG A SET</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>EXERCISE</label>
            <select className="input" value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              style={{ cursor: "pointer", fontSize: 15 }}>
              <option value="">Select exercise...</option>
              
              {sessionExercises.length > 0 && (
                <optgroup label="CURRENT SESSION">
                  {sessionExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </optgroup>
              )}

              <optgroup label="ALL EXERCISES">
                {otherExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {exerciseId && (
            <div style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text-muted)",
            }}>
              Set <span style={{ color: "var(--accent)", fontWeight: 600 }}>#{nextSet}</span>
              {nextSet > 1 && " — pre-filled from last set"}
            </div>
          )}

          <div className="add-form-grid">
            <div>
              <label htmlFor="reps" style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>REPS</label>
              <input id="reps" className="input" type="number" value={reps}
                onChange={(e) => setReps(e.target.value)}
                min={1} style={{ fontSize: 18, fontWeight: 600, textAlign: "center" }} />
            </div>
            <div>
              <label htmlFor="weight" style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>WEIGHT (kg)</label>
              <input id="weight" className="input" type="number" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min={0} step={0.5} style={{ fontSize: 18, fontWeight: 600, textAlign: "center" }} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit}
            disabled={!exerciseId || saving}
            style={{ width: "100%", padding: "14px 20px", fontSize: 16, marginTop: 4 }}>
            {saving ? "Saving..." : "Log Set"}
          </button>
        </div>
      </div>
    </div>
  );
}