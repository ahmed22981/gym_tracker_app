import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createTemplate } from "../api/client";
import type { Exercise } from "../types";

export default function NewTemplate() {
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
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
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

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>CREATE ROUTINE</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Build a reusable workout template</div>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
          Cancel
        </button>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 24 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
          ROUTINE NAME
        </label>
        <input
          className="input"
          placeholder="e.g. Heavy Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={{ fontSize: 16 }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 16 }}>SELECT EXERCISES ({selectedIds.length})</h3>
        
        {exercises.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>
            No exercises found. Go to the Exercises tab to add some first!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exercises.map((ex) => {
              const isSelected = selectedIds.includes(ex.id);
              return (
                <div 
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: isSelected ? "rgba(204, 255, 0, 0.05)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: isSelected ? "var(--accent)" : "var(--text)", marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ex.target_muscle}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", 
                    border: `2px solid ${isSelected ? "var(--accent)" : "var(--text-muted)"}`,
                    background: isSelected ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {isSelected && <span style={{ color: "#000", fontSize: 12, fontWeight: "bold" }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button 
        className="btn-primary" 
        style={{ width: "100%", padding: "14px 20px", fontSize: 16 }}
        onClick={handleSave}
        disabled={loading || !name.trim() || selectedIds.length === 0}
      >
        {loading ? "Saving..." : "Save Routine"}
      </button>
    </div>
  );
}