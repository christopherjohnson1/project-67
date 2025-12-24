/**
 * Game Node Model
 * Represents a location/puzzle node on the game board
 */
export interface GameNode {
  id: string;
  position: { x: number; y: number }; // percentage-based (0-100)
  status: 'locked' | 'unlocked' | 'current' | 'completed';
  puzzleId?: string;
  locationName: string;
  description?: string;
}

export type NodeStatus = GameNode['status'];

