import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TerminalLine {
  text: string;
  type: 'output' | 'command' | 'error' | 'success' | 'prompt' | 'warning' | 'info';
  timestamp?: Date;
}

export interface TerminalCommand {
  name: string;
  description?: string;
  handler: (args: string[]) => void | Promise<void>;
}

export interface TerminalConfig {
  prompt?: string;
  welcomeMessage?: string[];
  commands: TerminalCommand[];
  enableHistory?: boolean;
  enableAutocomplete?: boolean;
}

/**
 * Reusable Terminal Component
 * Generic terminal interface that can be used throughout the app
 * Supports custom commands, history, and styling
 */
@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalInput') terminalInput!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalContainer') terminalContainer!: ElementRef<HTMLDivElement>;

  @Input() config!: TerminalConfig;
  @Input() initialLines: TerminalLine[] = [];
  @Output() commandExecuted = new EventEmitter<{ command: string; args: string[] }>();
  @Output() terminalReady = new EventEmitter<void>();

  lines: TerminalLine[] = [];
  currentInput = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  isProcessing = false;
  showCursor = true;
  private cursorInterval?: number;
  private commandMap = new Map<string, TerminalCommand>();

  get prompt(): string {
    return this.config?.prompt || 'user@terminal:~$';
  }

  ngOnInit(): void {
    this.initializeCommands();
    this.displayWelcomeMessage();
    this.lines = [...this.initialLines, ...this.lines];
    this.startCursorBlink();
  }

  ngAfterViewInit(): void {
    this.focusInput();
    this.terminalReady.emit();
    
    // Listen for keyboard appearance on mobile
    this.setupMobileKeyboardHandling();
  }

  ngOnDestroy(): void {
    if (this.cursorInterval) {
      window.clearInterval(this.cursorInterval);
    }
  }

  private initializeCommands(): void {
    if (!this.config?.commands) {
      return;
    }

    // Map commands by name
    this.config.commands.forEach((cmd) => {
      this.commandMap.set(cmd.name.toLowerCase(), cmd);
    });

    // Add built-in commands
    this.commandMap.set('help', {
      name: 'help',
      description: 'Show available commands',
      handler: () => this.showHelp(),
    });

    this.commandMap.set('clear', {
      name: 'clear',
      description: 'Clear terminal screen',
      handler: () => this.clearTerminal(),
    });

    this.commandMap.set('history', {
      name: 'history',
      description: 'Show command history',
      handler: () => this.showHistory(),
    });
  }

  private startCursorBlink(): void {
    this.cursorInterval = window.setInterval(() => {
      this.showCursor = !this.showCursor;
    }, 500);
  }

  private displayWelcomeMessage(): void {
    if (this.config?.welcomeMessage) {
      this.config.welcomeMessage.forEach((line) => {
        this.addLine(line, 'output');
      });
      this.addLine('', 'output');
    }
  }

  private showHelp(): void {
    this.addLine('', 'output');
    this.addLine('Available commands:', 'info');
    this.addLine('', 'output');

    this.commandMap.forEach((cmd) => {
      const description = cmd.description || 'No description';
      this.addLine(`  ${cmd.name.padEnd(12)} - ${description}`, 'output');
    });

    this.addLine('', 'output');
  }

  private clearTerminal(): void {
    this.lines = [];
    this.displayWelcomeMessage();
  }

  private showHistory(): void {
    this.addLine('', 'output');
    this.addLine('Command history:', 'info');

    if (this.commandHistory.length === 0) {
      this.addLine('  (empty)', 'output');
    } else {
      this.commandHistory.forEach((cmd, index) => {
        this.addLine(`  ${index + 1}  ${cmd}`, 'output');
      });
    }

    this.addLine('', 'output');
  }

  async handleInput(event: KeyboardEvent): Promise<void> {
    if (this.isProcessing) {
      event.preventDefault();
      return;
    }

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

    if (event.key === 'Tab') {
      event.preventDefault();
      if (this.config?.enableAutocomplete) {
        this.autocomplete();
      }
    }
  }

  private navigateHistory(direction: 'up' | 'down'): void {
    if (!this.config?.enableHistory || this.commandHistory.length === 0) {
      return;
    }

    if (direction === 'up') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.currentInput =
          this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      }
    } else {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentInput =
          this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.currentInput = '';
      }
    }
  }

  private autocomplete(): void {
    if (!this.currentInput.trim()) {
      return;
    }

    const matches = Array.from(this.commandMap.keys()).filter((cmd) =>
      cmd.startsWith(this.currentInput.toLowerCase())
    );

    if (matches.length === 1) {
      this.currentInput = matches[0];
    } else if (matches.length > 1) {
      this.addLine(`  ${matches.join('  ')}`, 'info');
    }
  }

  private async processInput(): Promise<void> {
    const input = this.currentInput.trim();

    // Display the command
    this.addLine(`${this.prompt} ${input}`, 'command');

    // Add to history
    if (input && this.config?.enableHistory) {
      this.commandHistory.push(input);
      this.historyIndex = -1;
    }

    this.currentInput = '';

    if (!input) {
      this.focusInput();
      return;
    }

    // Parse command and arguments
    const parts = input.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Execute command
    const command = this.commandMap.get(commandName);

    if (command) {
      this.isProcessing = true;
      try {
        await command.handler(args);
        this.commandExecuted.emit({ command: commandName, args });
      } catch (error) {
        this.addLine(`Error executing command: ${error}`, 'error');
      } finally {
        this.isProcessing = false;
      }
    } else {
      this.addLine(`Command not found: ${commandName}`, 'error');
      this.addLine('Type "help" for available commands.', 'info');
    }

    this.focusInput();
  }

  /**
   * Public method to add lines to terminal
   * Can be called from parent component
   */
  addLine(text: string, type: TerminalLine['type'] = 'output'): void {
    this.lines.push({ text, type, timestamp: new Date() });
    // Use requestAnimationFrame for scroll
    requestAnimationFrame(() => this.scrollToBottom());
  }

  /**
   * Public method to add multiple lines
   */
  addLines(texts: string[], type: TerminalLine['type'] = 'output'): void {
    texts.forEach((text) => this.addLine(text, type));
  }

  /**
   * Public method to set processing state
   */
  setProcessing(state: boolean): void {
    this.isProcessing = state;
  }

  /**
   * Public method to clear terminal
   */
  clear(): void {
    this.clearTerminal();
  }

  private scrollToBottom(): void {
    if (this.terminalContainer) {
      const element = this.terminalContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private focusInput(): void {
    if (this.terminalInput?.nativeElement) {
      // PRE-scroll on mobile BEFORE focus
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        requestAnimationFrame(() => {
          if (this.terminalContainer) {
            const container = this.terminalContainer.nativeElement;
            container.scrollTop = container.scrollHeight;
          }
        });
      }
      
      this.terminalInput.nativeElement.focus();
      
      // Follow up with scroll adjustments after keyboard
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        setTimeout(() => this.scrollInputLineIntoView(), 100);
        setTimeout(() => this.scrollInputLineIntoView(), 300);
        setTimeout(() => this.scrollInputLineIntoView(), 500);
      }
    }
  }

  focusInputDirect(): void {
    if (this.terminalInput?.nativeElement) {
      this.terminalInput.nativeElement.focus();
      this.terminalInput.nativeElement.click();
    }
  }

  onTerminalClick(): void {
    this.focusInput();
  }

  onTerminalTouch(event: TouchEvent): void {
    this.focusInput();
    if (this.terminalInput?.nativeElement) {
      this.terminalInput.nativeElement.click();
    }
  }

  private scrollPending = false;
  private wrapperElement?: HTMLElement;
  
  private setupMobileKeyboardHandling(): void {
    // Get the wrapper element
    this.wrapperElement = this.terminalContainer?.nativeElement?.closest('.terminal-wrapper') as HTMLElement;
    
    // Detect mobile keyboard show/hide using visualViewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        const vvHeight = window.visualViewport?.height || window.innerHeight;
        
        // Adjust wrapper height to visualViewport on mobile
        if (this.wrapperElement && /Mobi|Android/i.test(navigator.userAgent)) {
          this.wrapperElement.style.height = `${vvHeight}px`;
        }
        
        // Debounced scroll to prevent performance issues
        if (!this.scrollPending) {
          this.scrollPending = true;
          requestAnimationFrame(() => {
            this.scrollInputLineIntoView();
            setTimeout(() => { this.scrollPending = false; }, 200);
          });
        }
      });
    }

    // Fallback for browsers without visualViewport
    window.addEventListener('resize', () => {
      if (!this.scrollPending) {
        this.scrollPending = true;
        requestAnimationFrame(() => {
          this.scrollInputLineIntoView();
          setTimeout(() => { this.scrollPending = false; }, 200);
        });
      }
    });

    // Scroll when input gains focus
    if (this.terminalInput?.nativeElement) {
      this.terminalInput.nativeElement.addEventListener('focus', () => {
        // Multiple scroll attempts to handle keyboard appearance timing
        setTimeout(() => this.scrollInputLineIntoView(), 100);
        setTimeout(() => this.scrollInputLineIntoView(), 300);
        setTimeout(() => this.scrollInputLineIntoView(), 500);
      });
      
      this.terminalInput.nativeElement.addEventListener('blur', () => {
        // On mobile, immediately refocus if blur wasn't user-initiated
        if (/Mobi|Android/i.test(navigator.userAgent) && !this.isProcessing) {
          setTimeout(() => {
            if (this.terminalInput?.nativeElement && 
                document.activeElement !== this.terminalInput.nativeElement) {
              this.terminalInput.nativeElement.focus();
            }
          }, 50);
        }
      });
    }
  }

  private scrollInputLineIntoView(): void {
    if (!this.terminalContainer) return;

    const container = this.terminalContainer.nativeElement;
    const inputLine = container.querySelector('.terminal-input-line') as HTMLElement;
    
    if (inputLine) {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const inputLineRect = inputLine.getBoundingClientRect();
      
      // If input line is below the visible viewport (hidden by keyboard)
      if (inputLineRect.bottom > viewportHeight) {
        // Use instant scroll to avoid feedback loops
        inputLine.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }
}

