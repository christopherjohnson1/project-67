/**
 * User progress model
 * Tracks puzzle completion and attempts
 */
export interface UserProgress {
  id: number;
  userId: string;
  puzzleId: number;
  isCompleted: boolean;
  completedAt?: Date;
  attempts: number;
  lastAttemptAt?: Date;
}

/**
 * Overall progress summary
 */
export interface ProgressSummary {
  totalPuzzles: number;
  completedPuzzles: number;
  currentPuzzle?: number;
  percentComplete: number;
}

/**
 * Hint model
 */
export interface Hint {
  id: number;
  puzzleId: number;
  hintOrder: number;
  hintText: string;
  cost: number;
  isUnlocked: boolean;
}

/**
 * Hint request result
 */
export interface HintRequestResult {
  hint: Hint;
  message: string;
}

