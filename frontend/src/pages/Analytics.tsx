import { useState, useEffect } from "react";
import { getHeatmapData, getExercises, getExerciseProgress } from "../api/client";
import BodyHeatmap from "../components/BodyHeatmap";
import ProgressChart from "../components/ProgressChart";
import type { Exercise, ExerciseProgress } from "../types";
import Preloader from "../components/Preloader";

export default function Analytics() {
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [progressData, setProgressData] = useState<ExerciseProgress[]>([]);
  const [loading, setLoading] = useState({ heatmap: true, chart: false });

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getHeatmapData(),
      getExercises()
    ]).then(([hData, exData]) => {
      if (!mounted) return;
      setHeatmapData(hData);
      setExercises(exData);
      if (exData.length > 0) setSelectedExercise(exData[0].id);
    })
    .catch(err => console.error("Analytics Load Error:", err))
    .finally(() => {
      if (mounted) setLoading(prev => ({ ...prev, heatmap: false }));
    });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedExercise) return;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(prev => ({ ...prev, chart: true }));
    
    getExerciseProgress(selectedExercise)
      .then(setProgressData)
      .catch(err => console.error("Chart Load Error:", err))
      .finally(() => setLoading(prev => ({ ...prev, chart: false })));
  }, [selectedExercise]);

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div className="font-display" style={{ fontSize: 36 }}>ANALYTICS</div>
      </div>

      {/* Muscle Heatmap Section */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 className="font-display" style={{ fontSize: 20, marginBottom: 20 }}>MUSCLE HEATMAP</h3>
        {loading.heatmap ? (
          <Preloader text="Loading Heatmap..." />
        ) : (
          <BodyHeatmap data={heatmapData} />
        )}
      </div>

      {/* Strength Progress Section */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h3 className="font-display" style={{ fontSize: 20 }}>STRENGTH PROGRESS</h3>
          
          <select 
            className="input" 
            style={{ width: "auto", minWidth: 200, cursor: "pointer", background: "var(--surface-2)" }}
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        {loading.chart ? (
          <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            Updating Chart...
          </div>
        ) : (
          <ProgressChart key={selectedExercise} data={progressData} />
        )}
      </div>
    </div>
  );
}