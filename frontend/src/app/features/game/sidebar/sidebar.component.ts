import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../shared/services/currency.service';
import { Subscription } from 'rxjs';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export interface UserInfo {
  username: string;
  avatarUrl?: string;
  coins: number;
  stars: number;
  level?: number;
}

/**
 * Sidebar Component
 * Displays user info, currency, and navigation menu
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Output() menuItemClick = new EventEmitter<string>();
  @Output() toggleCollapse = new EventEmitter<void>();

  userInfo: UserInfo = {
    username: 'Adventurer',
    coins: 0,
    stars: 0,
  };

  menuItems: MenuItem[] = [
    {
      id: 'clues',
      label: 'Clues',
      icon: '🗝️',
      action: () => this.onMenuItemClick('clues'),
    },
    {
      id: 'buddies',
      label: 'Buddies',
      icon: '🐾',
      action: () => this.onMenuItemClick('buddies'),
    },
    {
      id: 'puzzles',
      label: 'Puzzles',
      icon: '🎯',
      action: () => this.onMenuItemClick('puzzles'),
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: '🏆',
      action: () => this.onMenuItemClick('achievements'),
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      action: () => this.onMenuItemClick('help'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      action: () => this.onMenuItemClick('settings'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      action: () => this.logout(),
    },
  ];

  private currencySubscription?: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly currencyService: CurrencyService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userInfo.username = user.username;
    }

    // Subscribe to currency updates
    this.currencySubscription = this.currencyService.currency$.subscribe(currency => {
      this.userInfo.coins = currency.coins;
      this.userInfo.stars = currency.stars;
    });
  }

  ngOnDestroy(): void {
    this.currencySubscription?.unsubscribe();
  }

  onMenuItemClick(itemId: string): void {
    this.menuItemClick.emit(itemId);
  }

  onToggle(): void {
    this.toggleCollapse.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}


