import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-buddies-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal title="Hint Buddies" (closeModal)="onClose()">
      <div class="modal-body">
        <h3>🐾 Your Companions</h3>
        <p>Hint buddies provide guidance when you're stuck!</p>
        <div class="buddies-list">
          <div class="buddy-card">
            <div class="buddy-icon">🦜</div>
            <div class="buddy-info">
              <h4>Polly the Parrot</h4>
              <p>Offers riddles and cryptic clues</p>
              <button class="buddy-button">Ask for Hint</button>
            </div>
          </div>
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
      .buddy-card {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: rgba(212, 175, 55, 0.1);
        border-radius: var(--border-radius-md);
        margin-bottom: var(--spacing-md);
      }
      .buddy-icon {
        font-size: var(--font-size-4xl);
      }
      .buddy-info h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-family: var(--font-family-heading);
      }
      .buddy-button {
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--color-gold-primary);
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
      }
    }
  `],
})
export class BuddiesModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  onClose(): void {
    this.closeModal.emit();
  }
}
