import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Share2, Download } from "lucide-react";
import type { WorkoutSession } from "../types";

interface Props {
  session: WorkoutSession;
}

export default function StoryExport({ session }: Props) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [loadingAction, setLoadingAction] = useState<'share' | 'download' | null>(null);

  const exerciseSummary = session.logs.reduce((acc, log) => {
    if (!acc[log.exercise_name]) {
      acc[log.exercise_name] = { sets: 0, topWeight: 0 };
    }
    acc[log.exercise_name].sets += 1;
    if (log.weight > acc[log.exercise_name].topWeight) {
      acc[log.exercise_name].topWeight = log.weight;
    }
    return acc;
  }, {} as Record<string, { sets: number; topWeight: number }>);

  const exercises = Object.entries(exerciseSummary);
  const totalVolume = session.logs.reduce((sum, log) => sum + (log.weight * log.reps), 0);

  const handleExport = async (action: 'share' | 'download') => {
    if (!storyRef.current) return;
    setLoadingAction(action);

    try {
      const canvas = await html2canvas(storyRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: "#0a0a0a",
      });
      
      const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!imageBlob) throw new Error("Canvas to Blob failed");

      if (action === 'share') {
        const file = new File([imageBlob], `${session.name}-workout.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Crushed my workout!',
            text: `Just finished a ${session.name} session on GymTracker.`,
            files: [file]
          });
        } else {
          downloadImage(imageBlob);
        }
      } else {
        downloadImage(imageBlob);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to create story. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const downloadImage = (blob: Blob) => {
    const imageUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${session.name.replace(/\s+/g, '-')}-story.png`;
    link.href = imageUrl;
    link.click();
    URL.revokeObjectURL(imageUrl);
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button 
          onClick={() => handleExport('download')} 
          disabled={loadingAction !== null}
          className="btn-ghost" 
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", fontSize: 13 }}
        >
          {loadingAction === 'download' ? "..." : <><Download size={14} /> Save</>}
        </button>
        
        <button 
          onClick={() => handleExport('share')} 
          disabled={loadingAction !== null}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", fontSize: 13, background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          {loadingAction === 'share' ? "..." : <><Share2 size={14} />Story</>}
        </button>
      </div>

      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div 
          ref={storyRef} 
          style={{ 
            width: "360px",
            height: "640px", 
            background: "linear-gradient(180deg, #121212 0%, #0a0a0a 100%)", 
            color: "#fff", 
            padding: "32px 24px", 
            display: "flex", 
            flexDirection: "column", 
            fontFamily: "system-ui, -apple-system, sans-serif" 
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ color: "var(--accent)", fontWeight: 800, fontSize: 14, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
              GYM DIARY
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, textTransform: "uppercase" }}>
              {session.name}
            </div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
              {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: "16px 12px", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{exercises.length}</div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Exercises</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: "16px 12px", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{session.logs.length}</div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Total Sets</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Workout Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {exercises.slice(0, 5).map(([name, stats], idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
                  <div style={{ fontSize: 13, color: "#aaa" }}>{stats.sets} sets • <span style={{ color: "var(--accent)" }}>{stats.topWeight}kg max</span></div>
                </div>
              ))}
              {exercises.length > 5 && (
                <div style={{ textAlign: "center", fontSize: 13, color: "#666", marginTop: 8 }}>+ {exercises.length - 5} more exercises</div>
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, marginTop: "auto" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Total Volume: <span style={{ color: "var(--accent)" }}>{totalVolume.toLocaleString()} kg</span></div>
          </div>
        </div>
      </div>
    </>
  );
}