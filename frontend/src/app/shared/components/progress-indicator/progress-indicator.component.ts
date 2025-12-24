import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Progress Indicator Component
 * Shows visual progress through the treasure hunt
 */
@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
})
export class ProgressIndicatorComponent {
  @Input() totalPuzzles: number = 0;
  @Input() completedPuzzles: number = 0;
  @Input() showDetails: boolean = true;

  get progressPercentage(): number {
    if (this.totalPuzzles === 0) return 0;
    return Math.round((this.completedPuzzles / this.totalPuzzles) * 100);
  }

  get remainingPuzzles(): number {
    return this.totalPuzzles - this.completedPuzzles;
  }

  get isComplete(): boolean {
    return this.completedPuzzles === this.totalPuzzles && this.totalPuzzles > 0;
  }
}


