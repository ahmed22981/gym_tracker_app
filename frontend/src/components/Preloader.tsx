import { Loader2 } from "lucide-react";

interface PreloaderProps {
  fullScreen?: boolean;
  text?: string;
}

export default function Preloader({ fullScreen = false, text = "Loading..." }: PreloaderProps) {
  const containerStyles: React.CSSProperties = fullScreen
    ? {
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.75)",
        zIndex: 9999,
        backdropFilter: "blur(3px)"
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        width: "100%",
      };

  return (
    <div style={containerStyles}>
      <Loader2 
        className="animate-spin" 
        size={36} 
        color="var(--accent)" 
      />
      
      
      {text && (
        <span 
          className="animate-pulse font-display" 
          style={{ 
            marginTop: "16px", 
            color: "var(--text-muted)", 
            fontSize: "14px",
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}