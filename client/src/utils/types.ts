export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "manager" | "user";
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string | null;
  createdBy: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  name: string;
  assignedTo: string | null;
  assignedRole: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdBy: string;
  createdAt: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  title: string;
  status: "pending" | "in_progress" | "approved" | "rejected";
  currentStep: number;
  initiatedBy: string;
  data: Record<string, unknown>;
  steps: WorkflowStep[];
  createdAt: string;
}

export interface Approval {
  id: string;
  workflowInstanceId: string;
  stepOrder: number;
  stepName: string;
  assignedTo: string | null;
  assignedRole: string | null;
  status: "pending" | "approved" | "rejected";
  comments: string;
  createdAt: string;
}
