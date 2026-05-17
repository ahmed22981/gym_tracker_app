import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import type { Exercise } from "../types";
import { getExercises, createExercise } from "../api/client";
import ExerciseCard from "../components/ExerciseCard";

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [targetMuscle, setTargetMuscle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getExercises().then(setExercises).finally(() => setLoading(false));
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
      setName(""); 
      setTargetMuscle(""); 
      setVideoUrl(""); 
      setVideoFile(null);
      setShowForm(false);
    } finally { 
      setCreating(false); 
    }
  }

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.target_muscle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>EXERCISES</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{exercises.length} in your library</div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(p => !p)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {showForm ? <><X size={14} />Cancel</> : <><Plus size={14} />Add Exercise</>}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="font-display" style={{ fontSize: 20 }}>NEW EXERCISE</div>
          <div className="add-form-grid">
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>NAME *</label>
              <input className="input" placeholder="e.g. Bench Press" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>TARGET MUSCLE</label>
              <input className="input" placeholder="e.g. Chest, Triceps" value={targetMuscle} onChange={(e) => setTargetMuscle(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>YOUTUBE URL</label>
            <input className="input" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>OR UPLOAD VIDEO</label>
            <input type="file" accept="video/*" className="input" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} style={{ padding: "8px 12px" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={handleCreate} disabled={!name.trim() || creating}>
              {creating ? "Creating..." : "Create"}
            </button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input className="input" placeholder="Search by name or muscle..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", paddingTop: 40, textAlign: "center" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "var(--text-muted)", paddingTop: 40, textAlign: "center" }}>
          {search ? "No exercises match." : "No exercises yet. Add one above."}
        </div>
      ) : (
        <div className="exercise-grid">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex}
              onDeleted={(id) => setExercises(prev => prev.filter(e => e.id !== id))} />
          ))}
        </div>
      )}
    </div>
  );
}