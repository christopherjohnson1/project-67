import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-puzzles-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal title="Puzzles" (closeModal)="onClose()">
      <div class="modal-body">
        <h3>🎯 Puzzle Progress</h3>
        <div class="puzzle-list">
          <div class="puzzle-item completed">
            <span class="puzzle-status">✓</span>
            <span class="puzzle-name">Starting Beach</span>
          </div>
          <div class="puzzle-item locked">
            <span class="puzzle-status">🔒</span>
            <span class="puzzle-name">Ancient Temple</span>
          </div>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .puzzle-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .puzzle-item { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background: rgba(212, 175, 55, 0.1); border-radius: var(--border-radius-md); }
    .puzzle-status { font-size: var(--font-size-xl); }
  `],
})
export class PuzzlesModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  onClose(): void {
    this.closeModal.emit();
  }
}
