import { useEffect, useState } from "react";
import { api } from "../utils/api";
import type { Task, WorkflowInstance } from "../utils/types";
import { ios, statusColor } from "../utils/theme";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);

  useEffect(() => {
    api.get<Task[]>("/tasks").then(setTasks).catch(() => {});
    api.get<WorkflowInstance[]>("/workflows/instances").then(setInstances).catch(() => {});
  }, []);

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const pendingApprovals = instances.filter((i) => i.status === "pending" || i.status === "in_progress").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="To Do" value={todoCount} color={ios.orange} />
        <StatCard label="In Progress" value={inProgressCount} color={ios.blue} />
        <StatCard label="Completed" value={doneCount} color={ios.green} />
        <StatCard label="Pending" value={pendingApprovals} color={ios.purple} />
      </div>

      <div style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${ios.separator}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: ios.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>Recent Tasks</span>
        </div>
        {tasks.slice(0, 5).map((task, i) => (
          <div key={task.id} style={{ padding: "12px 16px", borderBottom: i < Math.min(tasks.length, 5) - 1 ? `0.5px solid ${ios.separator}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, color: ios.text }}>{task.title}</span>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: ios.gray6, color: statusColor[task.status] || ios.gray, fontWeight: 500 }}>{task.status.replace("_", " ")}</span>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div style={{ padding: "20px 16px", textAlign: "center", color: ios.gray, fontSize: 14 }}>No tasks yet</div>}
      </div>

      <div style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${ios.separator}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: ios.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>Active Workflows</span>
        </div>
        {instances.filter(i => i.status !== "approved" && i.status !== "rejected").slice(0, 5).map((inst, i) => {
          const arr = instances.filter(x => x.status !== "approved" && x.status !== "rejected").slice(0, 5);
          return (
            <div key={inst.id} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? `0.5px solid ${ios.separator}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, color: ios.text }}>{inst.title}</div>
                  <div style={{ fontSize: 12, color: ios.gray, marginTop: 2 }}>Step {inst.currentStep + 1}/{inst.steps.length}</div>
                </div>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: ios.gray6, color: statusColor[inst.status] || ios.gray, fontWeight: 500 }}>{inst.status}</span>
              </div>
            </div>
          );
        })}
        {instances.length === 0 && <div style={{ padding: "20px 16px", textAlign: "center", color: ios.gray, fontSize: 14 }}>No active workflows</div>}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: ios.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
