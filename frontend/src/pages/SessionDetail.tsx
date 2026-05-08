import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Dumbbell } from "lucide-react";
import type { WorkoutSession, WorkoutLog } from "../types";
import { getSession } from "../api/client";
import LogRow from "../components/LogRow";
import AddLogModal from "../components/AddLogModal";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSession(id).then((s) => {
      setSession(s);
      setLogs(s.logs.sort((a, b) => a.set_number - b.set_number));
    }).finally(() => setLoading(false));
  }, [id]);

  const grouped = logs.reduce<Record<string, WorkoutLog[]>>((acc, log) => {
    if (!acc[log.exercise_name]) acc[log.exercise_name] = [];
    acc[log.exercise_name].push(log);
    return acc;
  }, {});

  const totalVolume = logs.reduce((acc, l) => acc + l.reps * l.weight, 0);

  if (loading) return (
    <div style={{ color: "var(--text-muted)", paddingTop: 60, textAlign: "center" }}>Loading...</div>
  );

  if (!session) return (
    <div style={{ paddingTop: 60, textAlign: "center" }}>
      <div style={{ color: "var(--text-muted)" }}>Session not found.</div>
      <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => navigate("/sessions")}>Back</button>
    </div>
  );

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate("/sessions")} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-muted)", display: "flex", alignItems: "center",
        gap: 6, fontSize: 13, marginBottom: 16, fontFamily: "inherit", padding: 0,
      }}>
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>
            {session.name.toUpperCase()}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            {new Date(session.date).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={15} /> Log Set
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "SETS", value: logs.length },
          { label: "EXERCISES", value: Object.keys(grouped).length },
          { label: "VOLUME", value: `${totalVolume.toFixed(0)}kg` },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Logs */}
      {logs.length === 0 ? (
        <div className="card" style={{
          padding: 48, textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <Dumbbell size={36} color="var(--border)" />
          <div style={{ color: "var(--text-muted)" }}>No sets logged yet.</div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Log your first set</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.entries(grouped).map(([exerciseName, exerciseLogs]) => (
            <div key={exerciseName} className="card" style={{ overflow: "hidden" }}>
              {/* Exercise header */}
              <div style={{
                padding: "12px 16px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              }}>
                <div style={{
                  fontWeight: 600, fontSize: 14,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {exerciseName}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <span className="tag">{exerciseLogs.length} sets</span>
                  <span className="tag" style={{ color: "var(--accent)", borderColor: "var(--accent-dim)" }}>
                    {exerciseLogs.reduce((s, l) => s + l.reps * l.weight, 0).toFixed(0)}kg
                  </span>
                </div>
              </div>

              {/* Column headers */}
              <div className="log-header-row" style={{ borderBottom: "1px solid var(--border)" }}>
                {["SET", "EXERCISE", "REPS", "KG", ""].map((h, i) => (
                  <div key={i} style={{
                    fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
                    letterSpacing: "0.08em", textAlign: i > 1 ? "center" : "left",
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              {exerciseLogs.map((log) => (
                <LogRow key={log.id} log={log}
                  onUpdated={(updated) => setLogs(prev => prev.map(l => l.id === updated.id ? updated : l))}
                  onDeleted={(deletedId) => setLogs(prev => prev.filter(l => l.id !== deletedId))}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddLogModal
          sessionId={session.id}
          currentLogs={logs}
          onAdded={(log) => { setLogs(prev => [...prev, log]); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}