import { Injectable, ComponentRef, ViewContainerRef, Type } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ModalConfig {
  title?: string;
  data?: any;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: string;
}

export interface ModalRef<T = any> {
  componentRef: ComponentRef<T>;
  close: (result?: any) => void;
  afterClosed: Observable<any>;
}

/**
 * Modal Service
 * Manages modal dialogs with stack support
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private viewContainerRef?: ViewContainerRef;
  private modalStack: ModalRef[] = [];
  private readonly closeSubject = new Subject<any>();

  setViewContainerRef(vcr: ViewContainerRef): void {
    this.viewContainerRef = vcr;
  }

  open<T extends object>(component: Type<T>, config: ModalConfig = {}): ModalRef<T> {
    if (!this.viewContainerRef) {
      throw new Error('ViewContainerRef not set. Call setViewContainerRef first.');
    }

    const componentRef = this.viewContainerRef.createComponent(component);
    const closeSubject = new Subject<any>();

    // Pass config data to component if it has a data property
    if (config.data && 'data' in componentRef.instance) {
      (componentRef.instance as any).data = config.data;
    }

    // Pass config to component if it has a config property
    if ('config' in componentRef.instance) {
      (componentRef.instance as any).config = config;
    }

    const modalRef: ModalRef<T> = {
      componentRef,
      close: (result?: any) => {
        this.closeModal(modalRef, result);
      },
      afterClosed: closeSubject.asObservable(),
    };

    // Store close subject for this modal
    (modalRef as any)._closeSubject = closeSubject;

    this.modalStack.push(modalRef);

    // Setup backdrop click handler
    if (config.closeOnBackdrop !== false) {
      this.setupBackdropClickHandler(modalRef);
    }

    // Setup escape key handler
    if (config.closeOnEscape !== false) {
      this.setupEscapeKeyHandler(modalRef);
    }

    return modalRef;
  }

  private closeModal(modalRef: ModalRef, result?: any): void {
    const index = this.modalStack.indexOf(modalRef);
    if (index > -1) {
      this.modalStack.splice(index, 1);
    }

    modalRef.componentRef.destroy();
    
    if ((modalRef as any)._closeSubject) {
      (modalRef as any)._closeSubject.next(result);
      (modalRef as any)._closeSubject.complete();
    }
  }

  closeAll(): void {
    while (this.modalStack.length > 0) {
      const modalRef = this.modalStack[this.modalStack.length - 1];
      this.closeModal(modalRef);
    }
  }

  getOpenModals(): ModalRef[] {
    return [...this.modalStack];
  }

  private setupBackdropClickHandler(modalRef: ModalRef): void {
    // This will be handled by the modal component itself
  }

  private setupEscapeKeyHandler(modalRef: ModalRef): void {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.modalStack[this.modalStack.length - 1] === modalRef) {
        this.closeModal(modalRef);
        document.removeEventListener('keydown', handleEscape);
      }
    };

    document.addEventListener('keydown', handleEscape);
  }
}

