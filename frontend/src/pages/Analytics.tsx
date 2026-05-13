import { useState, useEffect } from "react";
import { getHeatmapData } from "../api/client";
import BodyHeatmap from "../components/BodyHeatmap";

export default function Analytics() {
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHeatmapData()
      .then(setData)
      .catch((err) => console.error("Failed to load heatmap", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>ANALYTICS</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Last 30 Days Muscle Heatmap</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: 40 }}>Loading heatmap...</div>
      ) : Object.keys(data).length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)" }}>No workouts logged in the last 30 days.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 24 }}>
          <BodyHeatmap data={data} />
          
          <div style={{ marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
            <h3 style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 16 }}>
              MUSCLE BREAKDOWN (SETS)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([muscle, count]) => (
                <div key={muscle} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--surface-2)", borderRadius: 8 }}>
                  <span style={{ textTransform: "capitalize", fontSize: 14 }}>{muscle}</span>
                  <span style={{ fontWeight: 600, color: "var(--accent)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}