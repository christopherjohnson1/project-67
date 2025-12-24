/**
 * User Progress Model
 * Tracks user's progress through the treasure hunt
 */
export interface UserProgress {
  userId: string;
  currentNodeId: string;
  completedNodes: string[];
  unlockedNodes: string[];
  totalScore: number;
  startedAt: Date;
  lastUpdated: Date;
}

