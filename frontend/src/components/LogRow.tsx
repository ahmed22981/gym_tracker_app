import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { WorkoutLog } from "../types";
import { updateLog, deleteLog } from "../api/client";

interface Props {
  log: WorkoutLog;
  onUpdated: (log: WorkoutLog) => void;
  onDeleted: (id: string) => void;
}

export default function LogRow({ log, onUpdated, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [reps, setReps] = useState(String(log.reps));
  const [weight, setWeight] = useState(String(log.weight));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateLog(log.id, { reps: Number(reps), weight: Number(weight) });
      onUpdated(updated);
      setEditing(false);
    } finally { setSaving(false); }
  }

  function handleCancel() {
    setReps(String(log.reps));
    setWeight(String(log.weight));
    setEditing(false);
  }

  async function handleDelete() {
    await deleteLog(log.id);
    onDeleted(log.id);
  }

  return (
    <div
      className="log-row"
      style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {/* Set badge */}
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: "var(--surface-2)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 600, color: "var(--accent)", flexShrink: 0,
      }}>
        {log.set_number}
      </div>

      {/* Exercise name */}
      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {log.exercise_name}
      </div>

      {/* Reps */}
      {editing ? (
        <input className="input" type="number" value={reps}
          onChange={(e) => setReps(e.target.value)}
          style={{ textAlign: "center", padding: "5px 6px", fontSize: 13 }} min={1} />
      ) : (
        <div style={{ textAlign: "center", fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>{log.reps}</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}> r</span>
        </div>
      )}

      {/* Weight */}
      {editing ? (
        <input className="input" type="number" value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{ textAlign: "center", padding: "5px 6px", fontSize: 13 }} min={0} step={0.5} />
      ) : (
        <div style={{ textAlign: "center", fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>{log.weight}</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}> kg</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        {editing ? (
          <>
            <button onClick={handleSave} disabled={saving} style={{
              background: "var(--accent)", border: "none", borderRadius: 6,
              padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center",
            }}>
              <Check size={12} color="#0a0a0a" strokeWidth={2.5} />
            </button>
            <button onClick={handleCancel} style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "5px 7px", cursor: "pointer",
              display: "flex", alignItems: "center",
            }}>
              <X size={12} color="var(--text-muted)" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "5px 6px", borderRadius: 6, color: "var(--text-muted)", transition: "color 0.15s",
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              <Pencil size={12} />
            </button>
            <button onClick={handleDelete} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "5px 6px", borderRadius: 6, color: "var(--text-muted)", transition: "color 0.15s",
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--danger)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}