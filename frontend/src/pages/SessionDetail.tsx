import {ArrowLeft, Dumbbell, Play, Plus} from "lucide-react";
import {useSessionDetail} from "../hooks/useSessionDetail";
import LogRow from "../components/LogRow";
import AddLogModal from "../components/AddLogModal";
import StoryExport from "../components/StoryExport";
import VideoModal from "../components/VideoModal";
import Preloader from "../components/Preloader";

export default function SessionDetail() {
  const {
    navigate,
    session,
    logs,
    loading,
    showModal,
    setShowModal,
    preSelectedExercise,
    videoToPlay,
    setVideoToPlay,
    openModalWithExercise,
    handlePlayVideo,
    grouped,
    totalVolume,
    handleLogUpdated,
    handleLogDeleted,
    handleLogAdded,
  } = useSessionDetail();

  if (loading) return <Preloader text="Loading..." />;

  if (!session)
    return (
      <div style={{paddingTop: 60, textAlign: "center"}}>
        <div style={{color: "var(--text-muted)"}}>Session not found.</div>
        <button
          className="btn-ghost"
          style={{marginTop: 12}}
          onClick={() => navigate("/sessions")}
        >
          Back
        </button>
      </div>
    );

  return (
    <div>
      <button
        onClick={() => navigate("/sessions")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          marginBottom: 16,
          fontFamily: "inherit",
          padding: 0,
        }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="page-header" style={{alignItems: "flex-start"}}>
        <div>
          <div className="font-display" style={{fontSize: 36, lineHeight: 1}}>
            {session.name.toUpperCase()}
          </div>
          <div style={{color: "var(--text-muted)", fontSize: 13, marginTop: 4}}>
            {new Date(session.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div
          style={{display: "flex", flexDirection: "column", minWidth: "160px"}}
        >
          <button
            className="btn-primary"
            onClick={() => openModalWithExercise()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Plus size={15} /> Log Set
          </button>

          {logs.length > 0 && <StoryExport session={{...session, logs}} />}
        </div>
      </div>

      <div className="stats-grid">
        {[
          {label: "SETS", value: logs.length},
          {label: "EXERCISES", value: Object.keys(grouped).length},
          {label: "VOLUME", value: `${totalVolume.toFixed(0)}kg`},
        ].map(({label, value}) => (
          <div
            key={label}
            className="card"
            style={{padding: "14px 12px", textAlign: "center"}}
          >
            <div style={{fontSize: 24, fontWeight: 700, lineHeight: 1}}>
              {value}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {logs.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Dumbbell size={36} color="var(--border)" />
          <div style={{color: "var(--text-muted)"}}>No sets logged yet.</div>
          <button
            className="btn-primary"
            onClick={() => openModalWithExercise()}
          >
            Log your first set
          </button>
        </div>
      ) : (
        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          {Object.entries(grouped).map(([exerciseName, exerciseLogs]) => {
            const hasVideo = !!(
              exerciseLogs[0]?.video_file || exerciseLogs[0]?.video_url
            );

            return (
              <div
                key={exerciseName}
                className="card"
                style={{overflow: "hidden"}}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {exerciseName}
                    </div>
                    {hasVideo && (
                      <button
                        onClick={() =>
                          handlePlayVideo(
                            exerciseLogs[0].video_file,
                            exerciseLogs[0].video_url,
                          )
                        }
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: 4,
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "var(--accent)",
                          flexShrink: 0,
                        }}
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{display: "flex", gap: 6}}>
                      <span className="tag">{exerciseLogs.length} sets</span>
                      <span
                        className="tag"
                        style={{
                          color: "var(--accent)",
                          borderColor: "var(--accent-dim)",
                        }}
                      >
                        {exerciseLogs
                          .reduce((s, l) => s + l.reps * l.weight, 0)
                          .toFixed(0)}{" "}
                        kg
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        openModalWithExercise(exerciseLogs[0].exercise)
                      }
                      style={{
                        background: "var(--accent)",
                        border: "none",
                        borderRadius: 4,
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#000",
                      }}
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div
                  className="log-header-row"
                  style={{borderBottom: "1px solid var(--border)"}}
                >
                  {["SET", "EXERCISE", "REPS", "KG", ""].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        letterSpacing: "0.08em",
                        textAlign: i > 1 ? "center" : "left",
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {exerciseLogs.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    onUpdated={handleLogUpdated}
                    onDeleted={handleLogDeleted}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddLogModal
          sessionId={session.id}
          currentLogs={logs}
          initialExerciseId={preSelectedExercise}
          onAdded={handleLogAdded}
          onClose={() => setShowModal(false)}
        />
      )}

      {videoToPlay && (
        <VideoModal
          file={videoToPlay.file}
          url={videoToPlay.url}
          onClose={() => setVideoToPlay(null)}
        />
      )}
    </div>
  );
}
