/**
 * Puzzle model
 * Represents a treasure hunt puzzle
 */
export interface Puzzle {
  id: number;
  orderNumber: number;
  title: string;
  description?: string;
  puzzleType: PuzzleType;
  puzzleData: Record<string, any>;
  imageUrl?: string;
  clueText?: string;
}

/**
 * Puzzle types
 */
export type PuzzleType = 'riddle' | 'cipher' | 'image' | 'form' | 'code' | 'location';

/**
 * Puzzle attempt submission
 */
export interface PuzzleAttempt {
  puzzleId: number;
  answer: string;
}

/**
 * Puzzle attempt result
 */
export interface PuzzleAttemptResult {
  isCorrect: boolean;
  message: string;
  clueText?: string;
  consoleEasterEgg?: string;
}

