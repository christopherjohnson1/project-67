import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal title="Settings" (closeModal)="onClose()">
      <div class="modal-body">
        <h3>⚙️ Game Settings</h3>
        <div class="setting-item">
          <label>Sound Effects</label>
          <button class="toggle-button">ON</button>
        </div>
        <div class="setting-item">
          <label>Music</label>
          <button class="toggle-button">ON</button>
        </div>
        <div class="setting-item">
          <label>Animations</label>
          <button class="toggle-button">ON</button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .setting-item { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); border-bottom: 1px solid rgba(139, 69, 19, 0.2); }
    .toggle-button { padding: var(--spacing-sm) var(--spacing-md); background: var(--color-success); color: white; border: none; border-radius: var(--border-radius-sm); cursor: pointer; }
  `],
})
export class SettingsModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  onClose(): void {
    this.closeModal.emit();
  }
}
