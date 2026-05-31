export type TaskStatus = 'to-do' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string; // References TeamMember
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
  type: 'move' | 'create' | 'comment' | 'complete' | 'system';
  userId?: string;
}

export interface ProjectMeta {
  name: string;
  description: string;
  managerId: string;
}
