import { useEffect, useState } from "react";
import { api } from "../utils/api";
import type { Workflow, WorkflowInstance, User } from "../utils/types";
import { ios, statusColor } from "../utils/theme";

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<"templates" | "instances">("templates");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [steps, setSteps] = useState([{ name: "", assignedRole: "manager" }]);
  const [showLaunch, setShowLaunch] = useState<string | null>(null);
  const [launchTitle, setLaunchTitle] = useState("");

  const load = () => {
    api.get<Workflow[]>("/workflows").then(setWorkflows).catch(() => {});
    api.get<WorkflowInstance[]>("/workflows/instances").then(setInstances).catch(() => {});
    api.get<User[]>("/users").then(setUsers).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/workflows", { name, description: desc, steps: steps.filter((s) => s.name) });
    setName(""); setDesc(""); setSteps([{ name: "", assignedRole: "manager" }]);
    setShowForm(false);
    load();
  };

  const handleLaunch = async (wfId: string) => {
    await api.post(`/workflows/${wfId}/instances`, { title: launchTitle });
    setShowLaunch(null);
    setLaunchTitle("");
    load();
  };

  const handleApprove = async (id: string) => {
    await api.patch(`/workflows/instances/${id}/approve`, { comments: "Approved" });
    load();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    await api.patch(`/workflows/instances/${id}/reject`, { comments: reason || "Rejected" });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <button onClick={() => setTab("templates")} style={{
          flex: 1, padding: "10px 0", background: tab === "templates" ? ios.blue : ios.gray6,
          color: tab === "templates" ? "#fff" : ios.text, border: "none",
          borderRadius: ios.radius.md, fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          Templates
        </button>
        <button onClick={() => setTab("instances")} style={{
          flex: 1, padding: "10px 0", background: tab === "instances" ? ios.blue : ios.gray6,
          color: tab === "instances" ? "#fff" : ios.text, border: "none",
          borderRadius: ios.radius.md, fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          Instances
        </button>
        {tab === "templates" && (
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: "10px 20px", background: ios.blue, color: "#fff", border: "none",
            borderRadius: ios.radius.md, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {showForm ? "Cancel" : "+ New"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, padding: 16, marginBottom: 16 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" required style={{ width: "100%", padding: "14px 0", border: "none", borderBottom: `0.5px solid ${ios.separator}`, fontSize: 17, outline: "none", background: "none", color: ios.text, marginBottom: 12 }} />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" style={{ width: "100%", padding: "14px 0", border: "none", borderBottom: `0.5px solid ${ios.separator}`, fontSize: 15, outline: "none", background: "none", color: ios.text, minHeight: 60, resize: "none", marginBottom: 16 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: ios.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Approval Steps</div>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={step.name} onChange={(e) => { const s = [...steps]; s[i].name = e.target.value; setSteps(s); }} placeholder="Step name" style={{ flex: 1, padding: "10px 12px", border: `0.5px solid ${ios.separator}`, borderRadius: ios.radius.sm, fontSize: 14, outline: "none", background: ios.gray6, color: ios.text }} />
              <select value={step.assignedRole} onChange={(e) => { const s = [...steps]; s[i].assignedRole = e.target.value; setSteps(s); }} style={{ padding: "10px 12px", border: `0.5px solid ${ios.separator}`, borderRadius: ios.radius.sm, fontSize: 14, background: ios.gray6, color: ios.text, outline: "none" }}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
              {steps.length > 1 && <button type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))} style={{ padding: "10px 14px", background: "#FFF2F2", border: `0.5px solid ${ios.red}40`, borderRadius: ios.radius.sm, cursor: "pointer", color: ios.red, fontSize: 16 }}>×</button>}
            </div>
          ))}
          <button type="button" onClick={() => setSteps([...steps, { name: "", assignedRole: "manager" }])} style={{ width: "100%", padding: 10, background: ios.gray6, border: `0.5px dashed ${ios.separator}`, borderRadius: ios.radius.sm, cursor: "pointer", color: ios.blue, fontSize: 14, fontWeight: 500, marginBottom: 14 }}>+ Add Step</button>
          <button type="submit" style={{ width: "100%", padding: 14, background: ios.green, color: "#fff", border: "none", borderRadius: ios.radius.md, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Create Workflow</button>
        </form>
      )}

      {tab === "templates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {workflows.map((wf) => (
            <div key={wf.id} style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: ios.text }}>{wf.name}</div>
                <div style={{ fontSize: 13, color: ios.gray, marginTop: 2 }}>{wf.description}</div>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {wf.steps.map((s, i) => (
                    <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: ios.gray6, color: ios.textSecondary }}>
                      {i + 1}. {s.name} ({s.assignedRole})
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ borderTop: `0.5px solid ${ios.separator}`, padding: "12px 16px" }}>
                <button onClick={() => setShowLaunch(showLaunch === wf.id ? null : wf.id)} style={{ width: "100%", padding: "10px 0", background: ios.blue, color: "#fff", border: "none", borderRadius: ios.radius.sm, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Launch Workflow
                </button>
                {showLaunch === wf.id && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <input value={launchTitle} onChange={(e) => setLaunchTitle(e.target.value)} placeholder="Instance title" style={{ flex: 1, padding: "10px 12px", border: `0.5px solid ${ios.separator}`, borderRadius: ios.radius.sm, fontSize: 14, outline: "none", background: ios.gray6, color: ios.text }} />
                    <button onClick={() => handleLaunch(wf.id)} style={{ padding: "10px 20px", background: ios.green, color: "#fff", border: "none", borderRadius: ios.radius.sm, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Go</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {workflows.length === 0 && <div style={{ padding: "24px 16px", textAlign: "center", color: ios.gray, fontSize: 14 }}>No workflow templates yet</div>}
        </div>
      )}

      {tab === "instances" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {instances.map((inst, i) => (
            <div key={inst.id} style={{ background: ios.card, borderRadius: ios.radius.md, border: `0.5px solid ${ios.separator}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: ios.text }}>{inst.title}</div>
                  <div style={{ fontSize: 12, color: ios.gray, marginTop: 2 }}>{inst.workflowName} &middot; Step {inst.currentStep + 1}/{inst.steps.length}</div>
                </div>
                <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 10, background: inst.status === "approved" ? "#E8F8E8" : inst.status === "rejected" ? "#FFF2F2" : inst.status === "in_progress" ? "#E8F0FE" : "#FFF5E0", color: statusColor[inst.status] || ios.gray, fontWeight: 600 }}>
                  {inst.status.replace("_", " ")}
                </span>
              </div>
              {(inst.status === "pending" || inst.status === "in_progress") && (
                <div style={{ borderTop: `0.5px solid ${ios.separator}`, padding: "10px 16px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => handleApprove(inst.id)} style={{ padding: "8px 20px", background: ios.green, color: "#fff", border: "none", borderRadius: ios.radius.sm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                  <button onClick={() => handleReject(inst.id)} style={{ padding: "8px 20px", background: ios.red, color: "#fff", border: "none", borderRadius: ios.radius.sm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                </div>
              )}
            </div>
          ))}
          {instances.length === 0 && <div style={{ padding: "24px 16px", textAlign: "center", color: ios.gray, fontSize: 14 }}>No workflow instances yet</div>}
        </div>
      )}
    </div>
  );
}
