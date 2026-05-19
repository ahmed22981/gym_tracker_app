import { useState } from "react";
import { Play, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Exercise } from "../types";
import { deleteExercise } from "../api/client";
import Swal from "sweetalert2";

interface Props {
  exercise: Exercise;
  onDeleted: (id: string) => void;
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch { return null; }
}

export default function ExerciseCard({ exercise, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // useEffect(() => {
  //   if (exercise.video_file) {
  //     fetch(exercise.video_file, { mode: 'cors' }).catch(() => {});
  //   }
  // }, [exercise.video_file]);

  const ytId = exercise.video_url ? getYouTubeId(exercise.video_url) : null;
  const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to restore "${exercise.name}" again!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      setDeleting(true); 

      try {
        await deleteExercise(exercise.id);
        onDeleted(exercise.id);

        Swal.fire({
          title: 'Deleted!',
          text: 'Exercise deleted successfully',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false 
        });

      } catch {
        setDeleting(false); 

        Swal.fire({
          title: 'Excuse me',
          text: 'An error occurred during deletion',
          icon: 'error',
          showConfirmButton: true
        });
      }
    }
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {exercise.video_file ? (
        <video 
          src={exercise.video_file} 
          controls 
          muted
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", background: "#000" }} 
        />
      ) : thumbUrl ? (
        <div style={{ position: "relative" }}>
          <img src={thumbUrl} alt={exercise.name}
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
          <a href={exercise.video_url!} target="_blank" rel="noopener noreferrer"
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.35)", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.55)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.35)")}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Play size={18} fill="#0a0a0a" color="#0a0a0a" style={{ marginLeft: 2 }} />
            </div>
          </a>
        </div>
      ) : exercise.video_url ? (
        <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
          <div style={{
            width: "100%", aspectRatio: "16/9", background: "var(--surface-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.05)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)")}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Play size={18} fill="#0a0a0a" color="#0a0a0a" style={{ marginLeft: 2 }} />
            </div>
          </div>
        </a>
      ) : (
        <div style={{
          width: "100%", aspectRatio: "16/9", background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Play size={28} color="var(--border)" />
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {exercise.name}
            </div>
            <button onClick={() => setExpanded(p => !p)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              color: "var(--text-muted)", fontSize: 12, padding: "4px 0 0",
              fontFamily: "inherit",
            }}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Hide muscles" : "Show muscles"}
            </button>
          </div>
          <button onClick={handleDelete} disabled={deleting} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 4, borderRadius: 6,
            transition: "color 0.15s", flexShrink: 0,
          }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--danger)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {expanded && (
          <div style={{
            marginTop: 10, padding: "10px 12px",
            background: "var(--surface-2)", borderRadius: 8,
            fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6,
          }}>
            {exercise.target_muscle}
          </div>
        )}
      </div>
    </div>
  );
}