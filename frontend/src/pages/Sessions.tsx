
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ChevronRight, Dumbbell } from "lucide-react";
import type { WorkoutSession } from "../types";
import { getSessions, deleteSession } from "../api/client";
import Swal from "sweetalert2";
import Preloader from "../components/Preloader";

export default function Sessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSessions()
      .then((data) => setSessions(data.sort((a, b) => b.date.localeCompare(a.date))))
      .finally(() => setLoading(false));
  }, []);

async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You Will not restore this session again",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }) 
    if(result.isConfirmed){
      try{
        await deleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));

        Swal.fire({
          title: 'Deleted',
          text: 'Session deleted successfully',
          icon: 'success',
          timer: 1000,
          showCancelButton: false
        })
      }catch {
        Swal.fire({
          title: 'Excues me',
          text: 'Error occured during delete',
          icon: 'error',
          showCancelButton: true
        })
      }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>SESSIONS</div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{sessions.length} sessions logged</div>
      </div>

      {loading ? (
        <Preloader text="Loading Sessions..."/>
      ) : sessions.length === 0 ? (
        <div style={{ paddingTop: 60, textAlign: "center" }}>
          <Dumbbell size={40} color="var(--border)" style={{ margin: "0 auto 16px" }} />
          <div style={{ color: "var(--text-muted)" }}>No sessions yet.</div>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/sessions/new")}>
            Start your first session
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map((session) => {
            const totalSets = session.logs.length;
            const exercises = [...new Set(session.logs.map((l) => l.exercise_name))];

            return (
              <div key={session.id} className="card"
                onClick={() => navigate(`/sessions/${session.id}`)}
                style={{ padding: "14px 16px", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
              >
                <div className="session-card-inner">
                  {/* Date badge */}
                  <div style={{
                    minWidth: 44, textAlign: "center",
                    paddingRight: 14, borderRight: "1px solid var(--border)", flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                      {new Date(session.date).getDate()}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", marginTop: 2 }}>
                      {new Date(session.date).toLocaleString("default", { month: "short" })}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.name}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="tag">{totalSets} sets</span>
                      {exercises.slice(0, 2).map((ex) => (
                        <span key={ex} className="tag">{ex}</span>
                      ))}
                      {exercises.length > 2 && <span className="tag">+{exercises.length - 2}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <button onClick={(e) => handleDelete(e, session.id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", padding: 6, borderRadius: 6,
                      display: "flex", transition: "color 0.15s",
                    }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--danger)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={15} color="var(--text-muted)" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}