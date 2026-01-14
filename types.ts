
export enum TaskStatus {
  TODO = '未着手',
  IN_PROGRESS = '進行中',
  DONE = '完了'
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type UserRole = 'TEACHER' | 'STUDENT' | 'GUEST' | 'UNSET';

export interface TaskComment {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  isHelpRequired: boolean;
  assignees: string[];
  startDate: string;
  endDate: string;
  endTime?: string;
  progress: number;
  comments?: TaskComment[];
}

export interface EventMeeting {
  id: string;
  title: string;
  date: string;
}

export interface Event {
  id: string; // 3-digit ID
  title: string;
  description: string;
  tasks: Task[];
  isFinished: boolean;
  meetings: EventMeeting[];
  targetDate?: string;
  targetLabel?: string;
  leaderNames: string[]; // List of student leaders for this event
}

export interface Schedule {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  createdBy: string;
}

export interface MemberStatus {
  memberName: string;
  statusType: 'AVAILABLE' | 'BUSY' | 'LATER' | 'CLUB';
  message: string;
  updatedAt: string;
}

export type AttendanceType = 'CHECK_IN' | 'CHECK_OUT';
export type LocationCategory = 'GYM' | 'SHOPPING' | 'CLASSROOM' | 'OTHERS';

export interface AttendanceRecord {
  id: string;
  memberName: string;
  eventId: string;
  type: AttendanceType;
  timestamp: string; // ISO string
  locationCategory?: LocationCategory;
  locationDetail?: string;
}

export interface ChatMessage {
  id: string;
  eventId: string;
  senderName: string;
  senderId: string;
  text: string;
  timestamp: string;
  isGoogleUser?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isGoogleUser: boolean;
  role: UserRole;
  avatar?: string;
}

export interface AppState {
  events: Event[];
  attendance: AttendanceRecord[];
  members: string[];
  messages: ChatMessage[];
  schedules: Schedule[];
  memberStatuses: Record<string, MemberStatus>;
}

export type ActiveTab = 'dashboard' | 'kanban' | 'gantt' | 'attendance' | 'profile' | 'chat' | 'guide' | 'faq' | 'teacher_stats';
