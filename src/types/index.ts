export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "todo" | "in-progress" | "review" | "done";
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  email?: string;
  teamId?: string;
  healthScore: number;
  productivityScore: number;
  tasksCompleted: number;
  punctuality: number;
  /* percentage */ engagement: number;
  /* percentage */ skills?: string[];
}
export interface App {
  id: string;
  name: string;
  url: string;
  loginId: string;
  password?: string;
  teamId: string;
  creatorId: string;
  createdAt: any;
}
export interface SecurityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  type: "security" | "auth" | "system" | "warning";
  teamId: string;
  createdAt: any;
}
export interface TeamSettings {
  id: string;
  teamId: string;
  publicAccess: boolean;
  fileSharing: boolean;
  apiAccess: boolean;
  twoFactorRequired: boolean;
}
export interface Team {
  id: string;
  name: string;
  leadId: string;
  joinCode: string;
  createdAt: string;
}
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: any;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignees: string[];
  /* User IDs */ creatorId: string;
  createdAt: string;
  updatedAt?: string;
  deadline: string;
  progress: number;
  comments: Comment[];
  riskLevel: "low" | "medium" | "high";
  subtasks?: { id: string; title: string; completed: boolean }[];
}
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "task" | "mention" | "system" | "deadline";
  read: boolean;
  createdAt: string;
  link?: string;
}
export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  teamId: string;
  teamName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
export interface Favorite {
  id: string;
  userId: string;
  teamId: string;
  title: string;
  type: string;
  category: string;
  updatedAt: any;
}
export interface TeamStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageHealthScore: number;
  productivityTrend: { date: string; score: number }[];
  completionRateByDepartment: { department: string; rate: number }[];
}
