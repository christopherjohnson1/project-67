import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface HintDialogData {
  puzzleTitle: string;
  hint: string;
  hintNumber?: number;
  totalHints?: number;
}

/**
 * Hint Dialog Component
 * Displays hints for puzzles in a Material dialog
 */
@Component({
  selector: 'app-hint-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './hint-dialog.component.html',
  styleUrls: ['./hint-dialog.component.scss'],
})
export class HintDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HintDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}


