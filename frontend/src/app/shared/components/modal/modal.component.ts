import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface BaseModalConfig {
  title?: string;
  closeOnBackdrop?: boolean;
  maxWidth?: string;
}

/**
 * Base Modal Component
 * Provides backdrop, close button, and animations
 * Can be extended or used as a wrapper
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ModalComponent {
  @Input() config: BaseModalConfig = {};
  @Input() title?: string;
  @Output() closeModal = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.config.closeOnBackdrop !== false) {
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.config.closeOnBackdrop !== false && event.target === event.currentTarget) {
      this.close();
    }
  }

  get modalTitle(): string {
    return this.title || this.config.title || '';
  }

  get modalMaxWidth(): string {
    return this.config.maxWidth || 'var(--modal-max-width)';
  }
}

