import { X, Plus } from "lucide-react";
import { useTimer } from "../context/TimerContext";

export default function FloatingTimer() {
  const { timeLeft, isActive, stopTimer, addTime } = useTimer();


  if (!isActive && timeLeft === 0) return null;


  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;


  const isEnding = timeLeft <= 10;

  return (
    <div className="floating-timer card" style={{
      position: "fixed",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "10px 20px",
      borderRadius: "100px", 
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
      border: `1px solid ${isEnding ? "var(--danger)" : "var(--accent)"}`,
      background: "var(--surface)",
      transition: "all 0.3s ease"
    }}>
      <div style={{ 
        color: isEnding ? "var(--danger)" : "var(--accent)", 
        fontWeight: 700, 
        fontSize: "20px", 
        fontVariantNumeric: "tabular-nums" 
      }}>
        {formattedTime}
      </div>

      <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />

      <button onClick={() => addTime(30)} style={{
        background: "transparent", border: "none", color: "var(--text)", 
        cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: 500
      }}>
        <Plus size={16} /> 30s
      </button>

      
      <button onClick={stopTimer} style={{
        background: "rgba(255, 68, 68, 0.1)", border: "none", color: "var(--danger)", 
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        width: "28px", height: "28px", borderRadius: "50%", padding: 0
      }}>
        <X size={16} />
      </button>
    </div>
  );
}