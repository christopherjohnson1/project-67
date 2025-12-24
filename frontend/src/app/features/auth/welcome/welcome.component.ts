import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TerminalComponent, TerminalConfig } from '../../../shared/components/terminal/terminal.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    TerminalComponent
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
  userName: string = '';
  terminalConfig!: TerminalConfig;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userName = user?.username || 'Adventurer';
    
    this.terminalConfig = {
      prompt: `${this.userName.toLowerCase()}@treasure:~$`,
      welcomeMessage: this.buildWelcomeMessage(),
      commands: [
        {
          name: 'begin',
          description: 'Start your treasure hunt adventure',
          handler: () => this.beginAdventure()
        },
        {
          name: 'start',
          description: 'Start your treasure hunt adventure (alias for begin)',
          handler: () => this.beginAdventure()
        },
        {
          name: 'logout',
          description: 'Logout and return to login screen',
          handler: () => this.logout()
        },
        {
          name: 'exit',
          description: 'Logout and return to login screen (alias for logout)',
          handler: () => this.logout()
        },
        {
          name: 'about',
          description: 'Learn more about this treasure hunt',
          handler: () => this.showAbout()
        },
        {
          name: 'whoami',
          description: 'Display current user information',
          handler: () => this.showWhoAmI()
        }
      ],
      enableHistory: true
    };
  }

  private buildWelcomeMessage(): string[] {
    return [
      '',
      '╔══════════════════════════════════════════════════════════╗',
      `║     WELCOME, ${this.userName.toUpperCase()}!`.padEnd(59, ' ') + '║',
      '║                                                          ║',
      '║         YOUR TREASURE HUNT ADVENTURE AWAITS              ║',
      '╚══════════════════════════════════════════════════════════╝',
      '',
      'You\'ve been chosen to embark on an extraordinary adventure.',
      'Along the way, you\'ll encounter puzzles that will challenge',
      'your wit, riddles that will test your creativity, and',
      'mysteries that will unveil themselves piece by piece.',
      '',
      '┌──────────────────────────────────────────────────────────┐',
      '│  🎲  SOLVE PUZZLES                                       │',
      '│      Each puzzle brings you closer to the ultimate       │',
      '│      treasure waiting to be discovered.                  │',
      '│                                                          │',
      '│  💡  REQUEST HINTS                                       │',
      '│      Stuck? Hints are available to guide you forward.    │',
      '│                                                          │',
      '│  ⭐  DISCOVER SECRETS                                     │',
      '│      Hidden easter eggs await the curious explorer.      │',
      '└──────────────────────────────────────────────────────────┘',
      '',
      '  "The treasure you seek lies not just at the end,',
      '   but in every step of the journey."',
      '',
      '══════════════════════════════════════════════════════════',
      '',
      'Available commands:',
      '  begin    - Start your adventure',
      '  about    - Learn more about this treasure hunt',
      '  whoami   - Display your user information',
      '  logout   - Exit and return to login screen',
      '  help     - Show all available commands',
      '',
      'Type a command to continue...',
      ''
    ];
  }

  private beginAdventure(): void {
    // TODO: Navigate to first puzzle when puzzles module is ready
    console.log('Beginning adventure...');
    // this.router.navigate(['/puzzles']);
  }

  private logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private showAbout(): void {
    return; // Info already shown in welcome message
  }

  private showWhoAmI(): void {
    const user = this.authService.getUser();
    console.log('User:', user);
  }
}

