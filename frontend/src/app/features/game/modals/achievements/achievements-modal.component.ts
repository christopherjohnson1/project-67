import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-achievements-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal title="Achievements" (closeModal)="onClose()">
      <div class="modal-body">
        <h3>🏆 Your Achievements</h3>
        <div class="achievements-grid">
          <div class="achievement earned">
            <div class="achievement-icon">⭐</div>
            <div class="achievement-title">First Steps</div>
          </div>
          <div class="achievement locked">
            <div class="achievement-icon">🔒</div>
            <div class="achievement-title">???</div>
          </div>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--spacing-md); }
    .achievement { padding: var(--spacing-md); text-align: center; background: rgba(212, 175, 55, 0.1); border-radius: var(--border-radius-md); }
    .achievement-icon { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-xs); }
    .achievement.locked { opacity: 0.5; }
  `],
})
export class AchievementsModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  onClose(): void {
    this.closeModal.emit();
  }
}
