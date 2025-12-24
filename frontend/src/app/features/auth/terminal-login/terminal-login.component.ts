import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface TerminalLine {
  text: string;
  type: 'output' | 'command' | 'error' | 'success' | 'prompt';
  timestamp?: Date;
}

interface CommandContext {
  awaitingPassword?: boolean;
  awaitingEmail?: boolean;
  email?: string;
}

@Component({
  selector: 'app-terminal-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal-login.component.html',
  styleUrls: ['./terminal-login.component.scss']
})
export class TerminalLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalInput') terminalInput!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalContainer') terminalContainer!: ElementRef<HTMLDivElement>;

  lines: TerminalLine[] = [];
  currentInput = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  context: CommandContext = {};
  isProcessing = false;
  showCursor = true;
  private cursorInterval?: number;

  private readonly PROMPT = 'guest@treasure:~$';
  private readonly commands = new Map<string, () => void>([
    ['help', () => this.showHelp()],
    ['login', () => this.startLogin()],
    ['about', () => this.showAbout()],
    ['whoami', () => this.showWhoAmI()],
    ['clear', () => this.clearTerminal()],
    ['exit', () => this.handleExit()],
  ]);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.showBootSequence();
    this.startCursorBlink();
  }

  ngAfterViewInit(): void {
    // Focus input immediately and again after a short delay for mobile
    this.focusInput();
    setTimeout(() => this.focusInput(), 500);
    setTimeout(() => this.focusInput(), 1000);
  }

  ngOnDestroy(): void {
    if (this.cursorInterval) {
      window.clearInterval(this.cursorInterval);
    }
  }

  private startCursorBlink(): void {
    this.cursorInterval = window.setInterval(() => {
      this.showCursor = !this.showCursor;
    }, 500);
  }

  private async showBootSequence(): Promise<void> {
    // Add all boot messages immediately so they're visible on page load
    const bootMessages = [
      'Initializing treasure hunt system...',
      'Loading security protocols...',
      'Establishing secure connection...',
      'System ready.',
      '',
      '╔═══════════════════════════════════════════════════════╗',
      '║         WELCOME TO THE TREASURE HUNT TERMINAL        ║',
      '║                                                       ║',
      '║  Type "help" for available commands                  ║',
      '║  Type "login" to begin your adventure                ║',
      '╚═══════════════════════════════════════════════════════╝',
      ''
    ];

    // Add all messages immediately for instant display
    bootMessages.forEach(message => {
      this.addLine(message, 'output');
    });

    // Boot complete, input is now ready
  }

  private showHelp(): void {
    this.addLine('', 'output');
    this.addLine('Available commands:', 'output');
    this.addLine('  help     - Display this help message', 'output');
    this.addLine('  login    - Start the authentication process', 'output');
    this.addLine('  about    - Learn about this treasure hunt', 'output');
    this.addLine('  whoami   - Display current user status', 'output');
    this.addLine('  clear    - Clear the terminal screen', 'output');
    this.addLine('  exit     - Leave the terminal', 'output');
    this.addLine('', 'output');
  }

  private startLogin(): void {
    if (this.context.awaitingEmail || this.context.awaitingPassword) {
      this.addLine('Login process already in progress.', 'error');
      return;
    }

    this.addLine('', 'output');
    this.addLine('=== Authentication Required ===', 'output');
    this.addLine('', 'output');
    this.context.awaitingEmail = true;
    this.addLine('Enter email address:', 'prompt');
  }

  private showAbout(): void {
    this.addLine('', 'output');
    this.addLine('🗺️  THE TREASURE HUNT', 'output');
    this.addLine('', 'output');
    this.addLine('A personalized adventure filled with puzzles,', 'output');
    this.addLine('mysteries, and hidden treasures waiting to be discovered.', 'output');
    this.addLine('', 'output');
    this.addLine('Each challenge brings you closer to the ultimate prize.', 'output');
    this.addLine('', 'output');
  }

  private showWhoAmI(): void {
    this.addLine('', 'output');
    if (this.authService.isAuthenticated()) {
      this.addLine('Current user: Raquel', 'success');
      this.addLine('Status: Authenticated', 'success');
    } else {
      this.addLine('Current user: guest', 'output');
      this.addLine('Status: Not authenticated', 'output');
      this.addLine('Type "login" to authenticate', 'output');
    }
    this.addLine('', 'output');
  }

  private clearTerminal(): void {
    this.lines = [];
  }

  private handleExit(): void {
    this.addLine('', 'output');
    this.addLine('Thank you for visiting. Goodbye!', 'output');
    this.addLine('', 'output');
  }

  async handleInput(event: KeyboardEvent): Promise<void> {
    if (this.isProcessing) {
      event.preventDefault();
      return;
    }

    // Handle arrow up/down for command history
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory('up');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory('down');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      await this.processInput();
    }
  }

  private navigateHistory(direction: 'up' | 'down'): void {
    if (this.commandHistory.length === 0) return;

    if (direction === 'up') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.currentInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      }
    } else {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.currentInput = '';
      }
    }
  }

  private async processInput(): Promise<void> {
    const input = this.currentInput.trim();

    // Display the command (masked if password)
    if (this.context.awaitingPassword) {
      this.addLine(`${this.PROMPT} ${'*'.repeat(input.length)}`, 'command');
    } else {
      this.addLine(`${this.PROMPT} ${input}`, 'command');
    }

    // Handle password input
    if (this.context.awaitingPassword) {
      await this.handlePassword(input);
      this.currentInput = '';
      this.focusInput();
      return;
    }

    // Handle email input
    if (this.context.awaitingEmail) {
      this.handleEmail(input);
      this.currentInput = '';
      this.focusInput();
      return;
    }

    // Regular command processing
    if (input) {
      this.commandHistory.push(input);
      this.historyIndex = -1;
    }

    this.currentInput = '';

    if (!input) {
      this.focusInput();
      return;
    }

    const command = input.toLowerCase();
    const handler = this.commands.get(command);

    if (handler) {
      handler();
    } else {
      this.addLine(`Command not found: ${input}`, 'error');
      this.addLine('Type "help" for available commands.', 'output');
    }

    this.focusInput();
  }

  private handleEmail(email: string): void {
    if (!email) {
      this.addLine('Email cannot be empty.', 'error');
      this.addLine('Enter email address:', 'prompt');
      return;
    }

    this.context.email = email;
    this.context.awaitingEmail = false;
    this.context.awaitingPassword = true;
    this.addLine('Enter password:', 'prompt');
  }

  private async handlePassword(password: string): Promise<void> {
    if (!password) {
      this.addLine('Password cannot be empty.', 'error');
      this.addLine('Enter password:', 'prompt');
      return;
    }

    this.isProcessing = true;
    this.addLine('', 'output');
    this.addLine('Authenticating...', 'output');

    try {
      await this.delay(500); // Simulate network delay

      await this.authService.login({
        email: this.context.email!,
        password: password
      }).toPromise();

      this.addLine('✓ Authentication successful!', 'success');
      this.addLine('Access granted. Redirecting...', 'success');
      this.addLine('', 'output');

      // Stop processing indicator to show success messages clearly
      this.isProcessing = false;

      await this.delay(1500);
      this.router.navigate(['/welcome']);
    } catch (error) {
      this.addLine('✗ Authentication failed.', 'error');
      this.addLine('Invalid credentials. Please try again.', 'error');
      this.addLine('', 'output');
      this.context = {};
      this.isProcessing = false;
    }
  }

  addLine(text: string, type: TerminalLine['type']): void {
    this.lines.push({ text, type, timestamp: new Date() });
    this.cdr.detectChanges(); // Force Angular to detect the new line
    setTimeout(() => this.scrollToBottom(), 10);
  }

  private scrollToBottom(): void {
    if (this.terminalContainer) {
      const element = this.terminalContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private focusInput(): void {
    setTimeout(() => {
      if (this.terminalInput?.nativeElement) {
        this.terminalInput.nativeElement.focus();
      }
    }, 10);
  }

  focusInputDirect(): void {
    if (this.terminalInput?.nativeElement) {
      this.terminalInput.nativeElement.focus();
      // On mobile, click triggers focus which shows keyboard
      this.terminalInput.nativeElement.click();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getPrompt(): string {
    if (this.context.awaitingEmail) {
      return 'email>';
    }
    if (this.context.awaitingPassword) {
      return 'password>';
    }
    return this.PROMPT;
  }

  onTerminalClick(): void {
    this.focusInput();
  }

  onTerminalTouch(event: TouchEvent): void {
    // On mobile, ensure input gets focus on touch
    event.preventDefault();
    this.focusInput();
  }
}

