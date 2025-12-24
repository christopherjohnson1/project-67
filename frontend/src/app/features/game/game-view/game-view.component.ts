import { Component, OnInit, ViewContainerRef, ViewChild, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { GameBoardComponent } from '../game-board/game-board.component';
import { CurrencyService } from '../../../shared/services/currency.service';
import { GameProgressService } from '../../../shared/services/game-progress.service';
import { AuthService } from '../../../core/services/auth.service';
import { CluesModalComponent } from '../modals/clues/clues-modal.component';
import { BuddiesModalComponent } from '../modals/buddies/buddies-modal.component';
import { PuzzlesModalComponent } from '../modals/puzzles/puzzles-modal.component';
import { AchievementsModalComponent } from '../modals/achievements/achievements-modal.component';
import { HelpModalComponent } from '../modals/help/help-modal.component';
import { SettingsModalComponent } from '../modals/settings/settings-modal.component';

/**
 * Main Game View Component
 * Container for the treasure hunt game interface
 * Manages sidebar, game board, and modals
 */
@Component({
  selector: 'app-game-view',
  standalone: true,
  imports: [CommonModule, SidebarComponent, GameBoardComponent],
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.scss'],
})
export class GameViewComponent implements OnInit {
  @ViewChild('modalContainer', { read: ViewContainerRef }) modalContainer!: ViewContainerRef;
  
  sidebarCollapsed = false;
  currentModalRef?: ComponentRef<any>;

  constructor(
    private readonly router: Router,
    private readonly currencyService: CurrencyService,
    private readonly gameProgressService: GameProgressService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize game progress if not exists
    const progress = this.gameProgressService.getProgress();
    if (!progress) {
      const user = this.authService.getUser();
      if (user) {
        this.gameProgressService.initializeProgress(user.id.toString(), 'start');
      }
    }
    
    // Initialize currency if needed
    const currency = this.currencyService.getCurrency();
    if (currency.coins === 0 && currency.stars === 0) {
      // Give starting currency
      this.currencyService.setCurrency({ coins: 100, stars: 5 });
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onMenuItemClick(itemId: string): void {
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed = true;
    }

    // Open corresponding modal
    this.openModal(itemId);
  }

  private openModal(modalId: string): void {
    // Close existing modal
    if (this.currentModalRef) {
      this.currentModalRef.destroy();
    }

    // Create new modal based on id
    const modalComponents: { [key: string]: any } = {
      'clues': CluesModalComponent,
      'buddies': BuddiesModalComponent,
      'puzzles': PuzzlesModalComponent,
      'achievements': AchievementsModalComponent,
      'help': HelpModalComponent,
      'settings': SettingsModalComponent,
    };

    const componentType = modalComponents[modalId];
    if (componentType && this.modalContainer) {
      this.currentModalRef = this.modalContainer.createComponent(componentType);
      
      // Subscribe to close event
      if (this.currentModalRef.instance.closeModal) {
        this.currentModalRef.instance.closeModal.subscribe(() => {
          this.closeModal();
        });
      }
    }
  }

  private closeModal(): void {
    if (this.currentModalRef) {
      this.currentModalRef.destroy();
      this.currentModalRef = undefined;
    }
  }
}

