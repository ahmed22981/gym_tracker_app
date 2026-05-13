// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createSession } from "../api/client";

// const QUICK_NAMES = [
//   "Push Day", "Pull Day", "Leg Day", "Upper Body",
//   "Full Body", "Chest & Triceps", "Back & Biceps",
//   "Shoulders", "Arms", "Cardio",
// ];

// export default function NewSession() {
//   const [name, setName] = useState("");
//   const [creating, setCreating] = useState(false);
//   const navigate = useNavigate();

//   async function handleCreate() {
//     if (!name.trim()) return;
//     setCreating(true);
//     try {
//       const session = await createSession({ name: name.trim() });
//       navigate(`/sessions/${session.id}`);
//     } finally { setCreating(false); }
//   }

//   return (
//     <div>
//       <div style={{ marginBottom: 28 }}>
//         <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>NEW SESSION</div>
//         <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Name your session and start tracking</div>
//       </div>

//       <div className="card" style={{ padding: 22 }}>
//         <div style={{ marginBottom: 18 }}>
//           <label style={{
//             fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
//             letterSpacing: "0.1em", display: "block", marginBottom: 8,
//           }}>
//             SESSION NAME
//           </label>
//           <input
//             className="input"
//             placeholder="e.g. Push Day"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleCreate()}
//             autoFocus
//             style={{ fontSize: 16 }}
//           />
//         </div>

//         <div style={{ marginBottom: 22 }}>
//           <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.08em" }}>
//             QUICK PICK
//           </div>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//             {QUICK_NAMES.map((n) => (
//               <button key={n} onClick={() => setName(n)} style={{
//                 background: name === n ? "var(--accent)" : "var(--surface-2)",
//                 border: `1px solid ${name === n ? "var(--accent)" : "var(--border)"}`,
//                 color: name === n ? "#0a0a0a" : "var(--text-muted)",
//                 borderRadius: 8, padding: "8px 14px",
//                 fontSize: 13, cursor: "pointer", transition: "all 0.15s",
//                 fontFamily: "inherit", fontWeight: name === n ? 600 : 400,
//               }}>
//                 {n}
//               </button>
//             ))}
//           </div>
//         </div>

//         <button className="btn-primary"
//           style={{ width: "100%", padding: "14px 20px", fontSize: 16 }}
//           onClick={handleCreate}
//           disabled={!name.trim() || creating}>
//           {creating ? "Starting..." : "Start Session →"}
//         </button>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createSession, getTemplates, startTemplateSession } from "../api/client";
import type { RoutineTemplate } from "../types";

const QUICK_NAMES = [
  "Push Day", "Pull Day", "Leg Day", "Upper Body",
  "Full Body", "Chest & Triceps", "Back & Biceps",
  "Shoulders", "Arms", "Cardio",
];

export default function NewSession() {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Template state
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch((err) => console.error("Failed to load templates", err))
      .finally(() => setLoadingTemplates(false));
  }, []);

  async function handleCreateEmpty() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const session = await createSession({ name: name.trim() });
      navigate(`/sessions/${session.id}`);
    } finally { 
      setCreating(false); 
    }
  }

  async function handleStartFromTemplate(templateId: string) {
    setStartingTemplateId(templateId);
    try {
      const session = await startTemplateSession(templateId);
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      console.error("Failed to start template session", err);
      alert("Something went wrong starting this routine.");
      setStartingTemplateId(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="font-display" style={{ fontSize: 36, lineHeight: 1 }}>START WORKOUT</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Choose a routine or start fresh</div>
        </div>
        <Link to="/templates/new" className="btn-primary" style={{ padding: "8px 16px", textDecoration: "none", fontSize: 13 }}>
          + New Routine
        </Link>
      </div>

      {/* SECTION 1: MY ROUTINES */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 16 }}>MY ROUTINES</h3>
        
        {loadingTemplates ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading routines...</div>
        ) : templates.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", borderStyle: "dashed" }}>
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>You haven't created any routines yet.</div>
            <Link to="/templates/new" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
              Create your first Routine Template →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {templates.map(template => (
              <div key={template.id} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{template.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {template.items.length} {template.items.length === 1 ? 'exercise' : 'exercises'}
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => handleStartFromTemplate(template.id)}
                  disabled={startingTemplateId === template.id}
                  style={{ width: "100%", padding: "10px", fontSize: 14 }}
                >
                  {startingTemplateId === template.id ? "Building Session..." : "Start Routine"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "var(--border)", marginBottom: 32 }} />

      {/* SECTION 2: START EMPTY SESSION (Original functionality) */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
            START BLANK SESSION
          </label>
          <input
            className="input"
            placeholder="e.g. Free Style Session"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateEmpty()}
            style={{ fontSize: 16 }}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.08em" }}>
            QUICK PICK
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUICK_NAMES.map((n) => (
              <button key={n} onClick={() => setName(n)} style={{
                background: name === n ? "var(--accent)" : "var(--surface-2)",
                border: `1px solid ${name === n ? "var(--accent)" : "var(--border)"}`,
                color: name === n ? "#0a0a0a" : "var(--text-muted)",
                borderRadius: 8, padding: "8px 14px",
                fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                fontFamily: "inherit", fontWeight: name === n ? 600 : 400,
              }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary"
          style={{ width: "100%", padding: "14px 20px", fontSize: 16, background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
          onClick={handleCreateEmpty}
          disabled={!name.trim() || creating}>
          {creating ? "Starting..." : "Start Blank Session →"}
        </button>
      </div>
    </div>
  );
}