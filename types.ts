
export enum TimerMode {
  FOCUS = 'FOCUS',
  PHYSICAL = 'PHYSICAL',
  BREAK = 'BREAK'
}

export interface Task {
  id: string;
  title: string;
  category: string;
  reminderTime: string; // HH:mm
  dueDate: string; // YYYY-MM-DD
  description?: string;
  isCompleted: boolean;
  createdAt: number;
}

export interface ProductivityHours {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AppState {
  tasks: Task[];
  productivityHours: ProductivityHours;
  lastNudgeTime: number;
  chatHistory: ChatMessage[];
}
