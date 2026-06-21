import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarDays, Plus, LayoutGrid, LogOut, User as UserIcon, Activity, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import FloatingTimer from "./FloatingTimer";
import { useState, useEffect } from "react";
import WelcomeOnboarding from "./WelcomeOnboarding";

const navItems = [
  { to: "/", label: "Exercises", icon: LayoutGrid, end: true },
  { to: "/sessions", label: "Sessions", icon: CalendarDays },
  { to: "/sessions/new", label: "New", icon: Plus },
  { to: "/analytics", label: "Analytics", icon: Activity },
  { to: "/nutrition", label: "Nutrition", icon: Flame },
];

export default function Layout() {
  const { logout, userName } = useAuth();
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>

      <WelcomeOnboarding />
      
      {!isMobile && (
        <nav className="desktop-sidebar" style={{
          width: 220, minWidth: 220,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          flexDirection: "column",
          display: "flex",
          padding: "28px 16px 16px 16px",
          gap: 4,
        }}>
          <div style={{ marginBottom: 36, paddingLeft: 8 }}>
            <div className="font-display" style={{ fontSize: 28, color: "var(--accent)", lineHeight: 1 }}>GYM</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>Tracker</div>
          </div>

          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, textDecoration: "none",
              fontSize: 14, fontWeight: 500,
              color: isActive ? "#0a0a0a" : "var(--text-muted)",
              background: isActive ? "var(--accent)" : "transparent",
              transition: "all 0.15s",
            })}>
              {({ isActive }) => (
                <><Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />{label === "New" ? "New Session" : label}</>
              )}
            </NavLink>
          ))}

          <div style={{ flex: 1 }} />
          
          <div style={{ 
            display: "flex", flexDirection: "column", gap: 8, 
            padding: "16px 8px 0 8px", 
            borderTop: "1px solid var(--border)",
            marginTop: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", fontSize: 14, fontWeight: 600, paddingLeft: 4 }}>
              <UserIcon size={16} color="var(--accent)" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName || "Athlete"}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, border: "none",
                background: "transparent", color: "var(--danger)",
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                textAlign: "left", width: "100%", transition: "background 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,68,68,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      {isMobile && (
        <nav className="mobile-bottom-nav" style={{
          display: "flex", position: "fixed", bottom: 0, left: 0, right: 0,
          background: "var(--surface)", borderTop: "1px solid var(--border)",
          zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)"
        }}>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 0", flex: 1, textDecoration: "none",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              transition: "color 0.15s", position: "relative",
            })}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: "absolute", top: 0, left: "50%",
                      transform: "translateX(-50%)",
                      width: 28, height: 2,
                      background: "var(--accent)",
                      borderRadius: "0 0 2px 2px",
                    }} />
                  )}
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: "0.03em" }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 0", flex: 1, border: "none",
              background: "transparent", color: "var(--danger)",
              cursor: "pointer",
              transition: "color 0.15s"
            }}
          >
            <LogOut size={21} strokeWidth={1.8} />
            <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.03em" }}>Logout</span>
          </button>
        </nav>
      )}

      <FloatingTimer />
    </div>
  );
}