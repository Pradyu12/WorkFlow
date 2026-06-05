import { useEffect, useState } from "react";
import { api } from "../utils/api";
import type { User } from "../utils/types";
import { useAuth } from "../utils/auth";
import { ios } from "../utils/theme";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    api.get<User[]>("/users").then(setUsers).catch(() => {});
  }, []);

  const handleRoleChange = async (uid: string, role: string) => {
    await api.patch(`/users/${uid}/role`, { role });
    setUsers(users.map((u) => (u.uid === uid ? { ...u, role: role as User["role"] } : u)));
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, { bg: string; fg: string }> = {
      admin: { bg: "#FFF5E0", fg: "#B8860B" },
      manager: { bg: "#E8F0FE", fg: ios.blue },
      user: { bg: ios.gray6, fg: ios.textSecondary },
    };
    const c = colors[role] || colors.user;
    return { background: c.bg, color: c.fg };
  };

  return (
    <div>
      {users.length === 0 ? (
        <div style={{ padding: "24px 16px", textAlign: "center", color: ios.gray, fontSize: 14 }}>No users found</div>
      ) : (
        <div style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, overflow: "hidden" }}>
          {users.map((u, i) => (
            <div key={u.uid} style={{ padding: "14px 16px", borderBottom: i < users.length - 1 ? `0.5px solid ${ios.separator}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: ios.text }}>{u.displayName}</div>
                  <div style={{ fontSize: 13, color: ios.gray, marginTop: 1 }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 10, fontWeight: 600, ...roleBadge(u.role) }}>{u.role}</span>
                  {currentUser?.role === "admin" && (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      style={{ padding: "6px 10px", border: `0.5px solid ${ios.separator}`, borderRadius: ios.radius.sm, fontSize: 13, background: ios.gray6, color: ios.text, outline: "none" }}
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
