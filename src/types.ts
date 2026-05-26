export interface ReferenceItem {
  id: string;
  name: string;
  type: 'link' | 'image' | 'pdf' | 'document' | 'note';
  value: string; // URL, file path, base64 content, or note text
  createdAt: string;
}

export type BookStatus = 'Draft' | 'In Progress' | 'Completed';
export type ChapterStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';
export type ChapterPriority = 'Low' | 'Medium' | 'High';

export interface Book {
  id: string;
  userId: string;
  title: string;
  genre: string;
  description: string;
  coverImage: string; // URL or base64 data url
  plannedChapters: number;
  writingGoal: number; // in words
  status: BookStatus;
  progress: number; // completion % (based on chapters and chapter progress)
  createdAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  userId: string;
  title: string;
  summary: string;
  notes: string;
  progress: number; // Chapter completion % (0 - 100)
  blocks: number; // Weighted block count (1 = S, 2 = M, 3 = L)
  pageCount: number;
  wordCount: number;
  status: ChapterStatus;
  priority: ChapterPriority;
  references: ReferenceItem[];
  order: number;
  updatedAt: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  threshold: number;
  type: 'wordCount' | 'streak' | 'bookCount' | 'chapterCount';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  wordsWritten: number;
  chaptersCompleted: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  writingStreak: number;
  lastWriteDate: string; // YYYY-MM-DD
  badges: string[]; // List of unlocked badge IDs
  dailyLogs: Record<string, DailyLog>; // Track daily metrics
}

export interface AppState {
  books: Book[];
  chapters: Chapter[];
  userProfile: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
}
