import { NavLink, Outlet } from "react-router-dom";
import { Dumbbell, CalendarDays, Plus, LayoutGrid } from "lucide-react";

const navItems = [
  { to: "/", label: "Exercises", icon: LayoutGrid, end: true },
  { to: "/sessions", label: "Sessions", icon: CalendarDays },
  { to: "/sessions/new", label: "New", icon: Plus },
];

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {/* Desktop Sidebar */}
      <nav className="desktop-sidebar" style={{
        width: 220, minWidth: 220,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        flexDirection: "column",
        padding: "28px 16px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", color: "var(--text-muted)" }}>
          <Dumbbell size={16} strokeWidth={1.5} />
          <span style={{ fontSize: 13 }}>Stay consistent.</span>
        </div>
      </nav>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
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
      </nav>
    </div>
  );
}