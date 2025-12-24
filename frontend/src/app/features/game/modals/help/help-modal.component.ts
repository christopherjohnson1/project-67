import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal title="Help & Instructions" (closeModal)="onClose()">
      <div class="modal-body">
        <h3>❓ How to Play</h3>
        <div class="help-section">
          <h4>📍 Navigation</h4>
          <p>Click on unlocked locations to explore and solve puzzles.</p>
        </div>
        <div class="help-section">
          <h4>🪙 Currency</h4>
          <p>Earn coins and stars by completing puzzles!</p>
        </div>
        <div class="help-section">
          <h4>🎯 Goal</h4>
          <p>Follow the treasure map and unlock all locations to find the final treasure!</p>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .help-section { margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: rgba(212, 175, 55, 0.05); border-radius: var(--border-radius-md); }
    .help-section h4 { margin: 0 0 var(--spacing-sm) 0; color: var(--color-gold-primary); }
  `],
})
export class HelpModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  onClose(): void {
    this.closeModal.emit();
  }
}
