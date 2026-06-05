import { useEffect, useState } from "react";
import { api } from "../utils/api";
import type { Task, User } from "../utils/types";
import { ios, statusColor, priorityColor } from "../utils/theme";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
] as const;

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");

  const loadTasks = () => api.get<Task[]>("/tasks").then(setTasks).catch(() => {});
  const loadUsers = () => api.get<User[]>("/users").then(setUsers).catch(() => {});

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/tasks", { title, description, priority, assignedTo: assignedTo || null });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignedTo("");
    setShowForm(false);
    loadTasks();
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    await api.patch(`/tasks/${taskId}`, { status });
    loadTasks();
  };

  const handleDelete = async (taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
    loadTasks();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "10px 20px", background: ios.blue, color: "#fff", border: "none", borderRadius: ios.radius.md, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, padding: 16, marginBottom: 16 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required style={{ width: "100%", padding: "14px 0", border: "none", borderBottom: `0.5px solid ${ios.separator}`, fontSize: 17, outline: "none", background: "none", color: ios.text, marginBottom: 12 }} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ width: "100%", padding: "14px 0", border: "none", borderBottom: `0.5px solid ${ios.separator}`, fontSize: 15, outline: "none", background: "none", color: ios.text, minHeight: 60, resize: "none", marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: `0.5px solid ${ios.separator}`, borderRadius: ios.radius.sm, fontSize: 14, background: ios.gray6, color: ios.text, outline: "none" }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: `0.5px solid ${ios.separator}`, borderRadius: ios.radius.sm, fontSize: 14, background: ios.gray6, color: ios.text, outline: "none" }}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.uid} value={u.uid}>{u.displayName}</option>)}
            </select>
          </div>
          <button type="submit" style={{ width: "100%", padding: 14, background: ios.green, color: "#fff", border: "none", borderRadius: ios.radius.md, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Create Task
          </button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${ios.separator}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: statusColor[col.key] || ios.text, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.label}</span>
                <span style={{ fontSize: 13, color: ios.gray, fontWeight: 500 }}>{columnTasks.length}</span>
              </div>
              {columnTasks.map((task) => (
                <div key={task.id} style={{ padding: "12px 16px", borderBottom: `0.5px solid ${ios.separator}` }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: ios.text }}>{task.title}</div>
                  {task.description && <div style={{ fontSize: 13, color: ios.gray, marginTop: 4 }}>{task.description}</div>}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: ios.gray6, color: priorityColor[task.priority] || ios.gray, fontWeight: 500 }}>{task.priority}</span>
                    {users.find((u) => u.uid === task.assignedTo)?.displayName && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: ios.gray6, color: ios.textSecondary, fontWeight: 500 }}>
                        {users.find((u) => u.uid === task.assignedTo)?.displayName}
                      </span>
                    )}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                      {col.key !== "todo" && <button onClick={() => handleStatusChange(task.id, COLUMNS[COLUMNS.indexOf(col) - 1].key)} style={smallBtn}>←</button>}
                      {col.key !== "done" && <button onClick={() => handleStatusChange(task.id, COLUMNS[COLUMNS.indexOf(col) + 1].key)} style={smallBtn}>→</button>}
                      <button onClick={() => handleDelete(task.id)} style={{ ...smallBtn, color: ios.red }}>×</button>
                    </div>
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && <div style={{ padding: "16px", textAlign: "center", color: ios.gray, fontSize: 13 }}>No tasks</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  padding: "4px 10px",
  background: ios.gray6,
  border: `0.5px solid ${ios.separator}`,
  borderRadius: 6,
  fontSize: 14,
  cursor: "pointer",
  color: ios.blue,
};
