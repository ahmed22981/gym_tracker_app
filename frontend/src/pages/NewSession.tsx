import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../api/client";

const QUICK_NAMES = [
  "Push Day", "Pull Day", "Leg Day", "Upper Body",
  "Full Body", "Chest & Triceps", "Back & Biceps",
  "Shoulders", "Arms", "Cardio",
];

export default function NewSession() {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const session = await createSession({ name: name.trim() });
      navigate(`/sessions/${session.id}`);
    } finally { setCreating(false); }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>NEW SESSION</div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Name your session and start tracking</div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{
            fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
            letterSpacing: "0.1em", display: "block", marginBottom: 8,
          }}>
            SESSION NAME
          </label>
          <input
            className="input"
            placeholder="e.g. Push Day"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
            style={{ fontSize: 16 }}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.08em" }}>
            QUICK PICK
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUICK_NAMES.map((n) => (
              <button key={n} onClick={() => setName(n)} style={{
                background: name === n ? "var(--accent)" : "var(--surface-2)",
                border: `1px solid ${name === n ? "var(--accent)" : "var(--border)"}`,
                color: name === n ? "#0a0a0a" : "var(--text-muted)",
                borderRadius: 8, padding: "8px 14px",
                fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                fontFamily: "inherit", fontWeight: name === n ? 600 : 400,
              }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary"
          style={{ width: "100%", padding: "14px 20px", fontSize: 16 }}
          onClick={handleCreate}
          disabled={!name.trim() || creating}>
          {creating ? "Starting..." : "Start Session →"}
        </button>
      </div>
    </div>
  );
}