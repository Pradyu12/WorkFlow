import { Task, TeamMember, ActivityLog } from './types';

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    email: 'sarah.j@company.com',
  },
  {
    id: 'alex',
    name: 'Alex Rivera',
    role: 'Backend Eng',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
    email: 'alex.r@company.com',
  },
  {
    id: 'emily',
    name: 'Emily Davis',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    email: 'emily.d@company.com',
  },
  {
    id: 'michael',
    name: 'Michael Chen',
    role: 'Frontend Eng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    email: 'michael.c@company.com',
  },
  {
    id: 'david',
    name: 'David Kim',
    role: 'Quality Assurance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    email: 'david.k@company.com',
  }
];

export const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act1',
    text: 'Task "Update API" moved to In Progress by Alex Rivera',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    type: 'move',
    userId: 'alex'
  },
  {
    id: 'act2',
    text: 'Task "Design Review" completed by Sarah Jenkins',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    type: 'complete',
    userId: 'sarah'
  },
  {
    id: 'act3',
    text: 'New comment on "Fix Bug #102" by Michael Chen',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    type: 'comment',
    userId: 'michael'
  },
  {
    id: 'act4',
    text: 'Task "Setup Firestore Database Schema" created by Emily Davis',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    type: 'create',
    userId: 'emily'
  },
  {
    id: 'act5',
    text: 'Task "Dockerize Server Deployment" moved to Blocked by Alex Rivera',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    type: 'move',
    userId: 'alex'
  }
];

// Seed exactly 124 tasks with exact distribution:
// - To Do: 37 tasks (30%)
// - In Progress: 45 tasks (36%)
// - Done: 30 tasks (24%)
// - Blocked: 12 tasks (10%)
export function seedTasks(): Task[] {
  const tasks: Task[] = [];
  const now = new Date();

  // Primary realistic tasks that users will see first:
  const primaryTasks: Partial<Task>[] = [
    {
      id: 'task-update-api',
      title: 'Update API Endpoints for Mobile Client',
      description: 'Implement correct query parameter parsing and extend the request validation rules for the user profile routes.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString().split('T')[0],
      assigneeId: 'alex'
    },
    {
      id: 'task-design-review',
      title: 'Design Review & Brand Assets Alignment',
      description: 'Review the latest high-fidelity interactive wireframes for the workspace onboarding experience.',
      status: 'done',
      priority: 'medium',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().split('T')[0],
      assigneeId: 'sarah'
    },
    {
      id: 'task-fix-bug-102',
      title: 'Fix Bug #102: Token Refresh Expiry Crash',
      description: 'Fix race conditions in the authentication middleware leading to an unhandled exception during key refresh cycles.',
      status: 'to-do',
      priority: 'high',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0],
      assigneeId: 'michael'
    },
    {
      id: 'task-dockerize',
      title: 'Dockerize Server Deployment & CI Pipeline',
      description: 'Create multi-stage production Dockerfiles and streamline Kubernetes manifests for the staging clusters.',
      status: 'blocked',
      priority: 'high',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString().split('T')[0],
      assigneeId: 'alex'
    },
    {
      id: 'task-figma',
      title: 'Design System Typography & Tokens',
      description: 'Define comprehensive Tailwind variables inside Figma to align cross-team asset generation workflows.',
      status: 'done',
      priority: 'low',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString().split('T')[0],
      assigneeId: 'emily'
    },
    {
      id: 'task-e2e',
      title: 'Setup Playwright E2E Integration Suite',
      description: 'Write comprehensive integration tests covering the payment checkouts and dynamic analytics graphs workflows.',
      status: 'to-do',
      priority: 'medium',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6).toISOString().split('T')[0],
      assigneeId: 'david'
    },
    {
      id: 'task-analytics',
      title: 'Real-time Chart Visualizer Component',
      description: 'Design and build the SVG-based custom Donut and progress graph widgets with elegant hover tooltips.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3).toISOString().split('T')[0],
      assigneeId: 'michael'
    }
  ];

  // Map initial tasks
  primaryTasks.forEach((p, idx) => {
    tasks.push({
      id: p.id || `task-primary-${idx}`,
      title: p.title || 'Dummy Title',
      description: p.description || 'No description provided.',
      status: p.status || 'to-do',
      priority: p.priority || 'medium',
      dueDate: p.dueDate || new Date().toISOString().split('T')[0],
      assigneeId: p.assigneeId || 'sarah',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * idx).toISOString(),
    });
  });

  // Target counts to match exact values in the screenshot:
  // To Do: 37, In Progress: 45, Done: 30, Blocked: 12. Total = 124.
  const targetCounts: Record<string, number> = {
    'to-do': 37,
    'in-progress': 45,
    'done': 30,
    'blocked': 12
  };

  const statusList = Object.keys(targetCounts) as ('to-do' | 'in-progress' | 'done' | 'blocked')[];
  const members = DEFAULT_TEAM_MEMBERS.map(m => m.id);
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  // Fill up each status category to match the required count
  statusList.forEach(status => {
    const currentCount = tasks.filter(t => t.status === status).length;
    const needed = targetCounts[status] - currentCount;

    for (let i = 0; i < needed; i++) {
      const randomMember = members[Math.floor(Math.random() * members.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      
      // Select appropriate due date window based on status
      let randomDays = 0;
      if (status === 'done') {
        randomDays = -Math.floor(Math.random() * 20) - 1; // 1 to 20 days ago
      } else {
        randomDays = Math.floor(Math.random() * 28) + 1; // 1 to 28 days from now
      }
      
      const dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + randomDays)
        .toISOString()
        .split('T')[0];

      tasks.push({
        id: `task-${status}-gen-${i}`,
        title: getSloganForStatus(status, i),
        description: `Auto-generated task to satisfy mock parameters. Part of the core milestone metrics tracker.`,
        status: status,
        priority: randomPriority,
        dueDate: dueDate,
        assigneeId: randomMember,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * (i + 12)).toISOString()
      });
    }
  });

  return tasks;
}

function getSloganForStatus(status: string, index: number): string {
  const toDoTitles = [
    'Add error boundaries to app entry',
    'Localize onboarding text strings',
    'Review Stripe webhook logging',
    'Audit CSS variables color values',
    'Write documentation for UI helpers',
    'Resolve ESLint rule complaints',
    'Optimize main bundle chunk load splits',
    'Configure favicon variations'
  ];
  const inProgressTitles = [
    'Refactor project database listeners',
    'Upgrade React hooks safety closures',
    'Optimize SVG path loading times',
    'Validate checkout card tokens integrations',
    'Create responsive calendar layouts',
    'Draft architecture deployment map',
    'Review Tailwind post-build scripts'
  ];
  const doneTitles = [
    'Bootstrap initial repository structure',
    'Create TS config compile rules',
    'Formulate color tokens variables schema',
    'Configure Vite bundler environment variables',
    'Connect SVG launcher icons configuration',
    'Validate CSS base normalization rules'
  ];
  const blockedTitles = [
    'Integrate third-party auth callbacks',
    'Review legal terms document updates',
    'Resolve core database cluster connections',
    'Obtain billing credential approvals'
  ];

  if (status === 'to-do') return toDoTitles[index % toDoTitles.length] + ` (#${300 + index})`;
  if (status === 'in-progress') return inProgressTitles[index % inProgressTitles.length] + ` (#${400 + index})`;
  if (status === 'done') return doneTitles[index % doneTitles.length] + ` (#${500 + index})`;
  return blockedTitles[index % blockedTitles.length] + ` (#${600 + index})`;
}
