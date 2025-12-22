import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface Puzzle {
  id: number;
  title: string;
  description?: string;
  type: string;
  imageUrl?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

/**
 * Reusable Puzzle Card Component
 * Displays puzzle information with consistent styling
 */
@Component({
  selector: 'app-puzzle-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './puzzle-card.component.html',
  styleUrls: ['./puzzle-card.component.scss'],
})
export class PuzzleCardComponent {
  @Input() puzzle!: Puzzle;
  @Input() showActions = true;
  @Output() startPuzzle = new EventEmitter<Puzzle>();
  @Output() requestHint = new EventEmitter<Puzzle>();

  onStartPuzzle(): void {
    if (!this.puzzle.isLocked) {
      this.startPuzzle.emit(this.puzzle);
    }
  }

  onRequestHint(): void {
    this.requestHint.emit(this.puzzle);
  }

  getPuzzleIcon(): string {
    if (this.puzzle.isCompleted) return 'check_circle';
    if (this.puzzle.isLocked) return 'lock';
    
    switch (this.puzzle.type) {
      case 'riddle':
        return 'quiz';
      case 'cipher':
        return 'vpn_key';
      case 'image':
        return 'image';
      case 'code':
        return 'code';
      case 'location':
        return 'place';
      default:
        return 'extension';
    }
  }

  getStatusChipColor(): string {
    if (this.puzzle.isCompleted) return 'primary';
    if (this.puzzle.isLocked) return 'warn';
    return 'accent';
  }

  getStatusText(): string {
    if (this.puzzle.isCompleted) return 'Completed';
    if (this.puzzle.isLocked) return 'Locked';
    return 'Available';
  }
}

