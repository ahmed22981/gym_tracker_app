import { X } from "lucide-react";

interface Props {
  file: string | null;
  url: string | null;
  onClose: () => void;
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch { return null; }
}

export default function VideoModal({ file, url, onClose }: Props) {
  if (!file && !url) return null;

  const safeVideoFile = file ? (file.includes('.mp4') ? file : `${file}.mp4`) : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0, 0, 0, 0.85)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        width: "100%", maxWidth: 600, background: "var(--surface)",
        borderRadius: 12, overflow: "hidden", position: "relative",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <button 
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff"
          }}
        >
          <X size={18} />
        </button>
        
        {safeVideoFile ? (
          <video 
            src={safeVideoFile} 
            controls muted autoPlay playsInline crossOrigin="anonymous" preload="metadata"
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", background: "#000" }} 
          />
        ) : url ? (
          getYouTubeId(url) ? (
             <iframe 
               width="100%" 
               style={{ aspectRatio: "16/9", border: "none", display: "block" }} 
               src={`https://www.youtube.com/embed/${getYouTubeId(url)}?autoplay=1`} 
               allow="autoplay; encrypted-media" 
               allowFullScreen 
             />
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
                Open Video Link
              </a>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}