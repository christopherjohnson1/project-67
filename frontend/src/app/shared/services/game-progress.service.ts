import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProgress } from '../../core/models/user-progress.model';
import { GameNode } from '../../core/models/game-node.model';

/**
 * Game Progress Service
 * Tracks and manages user progress through the game
 */
@Injectable({
  providedIn: 'root',
})
export class GameProgressService {
  private progressSubject = new BehaviorSubject<UserProgress | null>(null);
  public progress$: Observable<UserProgress | null> = this.progressSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  getProgress(): UserProgress | null {
    return this.progressSubject.value;
  }

  initializeProgress(userId: string, startNodeId: string): void {
    const progress: UserProgress = {
      userId,
      currentNodeId: startNodeId,
      completedNodes: [],
      unlockedNodes: [startNodeId],
      totalScore: 0,
      startedAt: new Date(),
      lastUpdated: new Date(),
    };
    this.progressSubject.next(progress);
    this.saveToStorage(progress);
  }

  completeNode(nodeId: string, score: number = 0): void {
    const current = this.progressSubject.value;
    if (!current) return;

    const updated: UserProgress = {
      ...current,
      completedNodes: [...current.completedNodes, nodeId],
      totalScore: current.totalScore + score,
      lastUpdated: new Date(),
    };

    this.progressSubject.next(updated);
    this.saveToStorage(updated);
  }

  moveToNode(nodeId: string): void {
    const current = this.progressSubject.value;
    if (!current) return;

    const updated: UserProgress = {
      ...current,
      currentNodeId: nodeId,
      lastUpdated: new Date(),
    };

    this.progressSubject.next(updated);
    this.saveToStorage(updated);
  }

  unlockNode(nodeId: string): void {
    const current = this.progressSubject.value;
    if (!current || current.unlockedNodes.includes(nodeId)) return;

    const updated: UserProgress = {
      ...current,
      unlockedNodes: [...current.unlockedNodes, nodeId],
      lastUpdated: new Date(),
    };

    this.progressSubject.next(updated);
    this.saveToStorage(updated);
  }

  isNodeUnlocked(nodeId: string): boolean {
    const progress = this.progressSubject.value;
    return progress?.unlockedNodes.includes(nodeId) || false;
  }

  isNodeCompleted(nodeId: string): boolean {
    const progress = this.progressSubject.value;
    return progress?.completedNodes.includes(nodeId) || false;
  }

  reset(): void {
    this.progressSubject.next(null);
    localStorage.removeItem('treasure_hunt_progress');
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('treasure_hunt_progress');
    if (stored) {
      try {
        const progress = JSON.parse(stored);
        // Convert date strings back to Date objects
        progress.startedAt = new Date(progress.startedAt);
        progress.lastUpdated = new Date(progress.lastUpdated);
        this.progressSubject.next(progress);
      } catch (error) {
        console.error('Failed to load progress from storage:', error);
      }
    }
  }

  private saveToStorage(progress: UserProgress): void {
    try {
      localStorage.setItem('treasure_hunt_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress to storage:', error);
    }
  }
}

