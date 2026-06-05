import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { ios } from "../utils/theme";

const tabs = [
  { to: "/", label: "Dashboard", icon: "house" },
  { to: "/tasks", label: "Tasks", icon: "checklist" },
  { to: "/workflows", label: "Workflows", icon: "flow" },
  { to: "/users", label: "Users", icon: "people" },
];

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? ios.blue : ios.gray;
  switch (name) {
    case "house":
      return (
        <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "checklist":
      return (
        <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x={9} y={3} width={6} height={4} rx={1} />
          <path d="M9 14l2 2 4-4" />
        </svg>
      );
    case "flow":
      return (
        <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "people":
      return (
        <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx={9} cy={7} r={4} />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: ios.bg }}>
        <div style={{ color: ios.gray, fontSize: 15 }}>Loading…</div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  const currentTab = tabs.find((t) =>
    t.to === "/" ? location.pathname === "/" : location.pathname.startsWith(t.to)
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: ios.bg }}>
      <header style={{
        padding: "56px 20px 12px",
        background: ios.card,
        borderBottom: `0.5px solid ${ios.separator}`,
      }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: ios.text }}>
          {currentTab?.label || "Workflow"}
        </div>
      </header>

      <main style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
        <Outlet />
      </main>

      <nav style={{
        background: ios.card,
        borderTop: `0.5px solid ${ios.separator}`,
        display: "flex",
        paddingBottom: 20,
        paddingTop: 6,
      }}>
        {tabs.map(({ to, label, icon }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <TabIcon name={icon} active={active} />
              <span style={{ fontSize: 10, color: active ? ios.blue : ios.gray, fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 44, background: ios.card, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 16px", borderBottom: `0.5px solid ${ios.separator}`, zIndex: 100 }}>
        <span style={{ fontSize: 13, color: ios.textSecondary, marginRight: 10 }}>{user.displayName}</span>
        <span style={{ fontSize: 11, color: ios.card, background: ios.blue, padding: "2px 8px", borderRadius: 10, fontWeight: 600, marginRight: 10 }}>{user.role}</span>
        <button onClick={logout} style={{ padding: "6px 12px", background: "none", border: "none", color: ios.red, fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 6 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
