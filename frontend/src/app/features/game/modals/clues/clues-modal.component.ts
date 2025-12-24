import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-clues-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal title="Clues" (closeModal)="onClose()">
      <div class="modal-body">
        <h3>🗝️ Your Clues</h3>
        <p>Clues will help you solve puzzles and progress in your adventure.</p>
        <div class="clue-list">
          <p><em>No active clues yet. Complete puzzles to unlock clues!</em></p>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .modal-body {
      h3 {
        font-family: var(--font-family-heading);
        color: var(--color-gold-primary);
        margin-bottom: var(--spacing-lg);
      }
      .clue-list {
        padding: var(--spacing-md);
        background: rgba(212, 175, 55, 0.1);
        border-radius: var(--border-radius-md);
      }
    }
  `],
})
export class CluesModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  onClose(): void {
    this.closeModal.emit();
  }
}
