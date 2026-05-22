import { useState, useEffect } from "react";
import { Dumbbell, ListPlus, TrendingUp, Flame, ChevronRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { completeOnboarding } from "../api/client";

export default function WelcomeOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { hasSeenOnboarding, completeOnboardingState } = useAuth();
  
  useEffect(() => {
    if (!hasSeenOnboarding) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [hasSeenOnboarding]);

  const handleComplete = async () => {
    setIsOpen(false);
    
    completeOnboardingState(); 

    try {
      await completeOnboarding();
    } catch (error) {
      console.error("Failed to save onboarding status", error);
    }
  };

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Dumbbell size={42} color="var(--accent)" />,
      title: "BUILD YOUR LIBRARY",
      description: "Start by adding your favorite exercises. Include names, target muscles, and YouTube videos for form reference."
    },
    {
      icon: <ListPlus size={42} color="var(--accent)" />,
      title: "CREATE ROUTINES",
      description: "Head over to 'New Session' to build your workout routines. Group your exercises so they're ready to go."
    },
    {
      icon: <TrendingUp size={42} color="var(--accent)" />,
      title: "TRACK & PROGRESS",
      description: "Log your sets. We'll automatically pre-fill your previous weights and reps to help you focus on progressive overload."
    },
    {
      icon: <Flame size={42} color="var(--accent)" />,
      title: "ANALYZE PERFORMANCE",
      description: "Check the Analytics page to see your workout heatmap and track your personal max weights over time."
    }
  ];

  return (
    <>
      <style>
        {`
          @keyframes modalEntrance {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes contentSlideUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-modal {
            animation: modalEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-content {
            animation: contentSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      <div style={{
        position: "fixed", inset: 0, 
        background: "rgba(0,0,0,0.75)", 
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", 
        zIndex: 99999,
        padding: 20
      }}>
        <div className="card animate-modal" style={{
          width: "100%", maxWidth: 420,
          padding: "32px 24px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          
          <div key={currentStep} className="animate-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            
            <div style={{
              width: 80, height: 80, borderRadius: "50%", 
              background: "rgba(206, 255, 0, 0.08)", 
              border: "1px solid rgba(206, 255, 0, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", 
              marginBottom: 16
            }}>
              {steps[currentStep].icon}
            </div>

            <div style={{ minHeight: 110 }}>
              <h2 className="font-display" style={{ fontSize: 24, marginBottom: 12, lineHeight: 1.1 }}>
                {steps[currentStep].title}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, padding: "0 10px" }}>
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, margin: "8px 0 16px 0" }}>
            {steps.map((_, index) => (
              <div key={index} style={{
                width: index === currentStep ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: index === currentStep ? "var(--accent)" : "var(--border)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" // انتقال ناعم للنقط
              }} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            {currentStep < steps.length - 1 ? (
              <>
                <button 
                  onClick={handleComplete}
                  style={{ 
                    flex: 1, padding: "12px", background: "transparent", 
                    border: "1px solid var(--border)", borderRadius: 8,
                    color: "var(--text-muted)", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  Skip Tour
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px" }} 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Next <ChevronRight size={18} />
                </button>
              </>
            ) : (
              <button 
                className="btn-primary" 
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px" }} 
                onClick={handleComplete}
              >
                Let's Get Strong <Check size={18} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}