import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  userName: string = '';
  showContent = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userName = user?.username || 'Adventurer';
    
    // Fade in animation
    setTimeout(() => {
      this.showContent = true;
    }, 100);
  }

  beginAdventure(): void {
    // TODO: Navigate to first puzzle when puzzles module is ready
    // For now, just show a message
    console.log('Beginning adventure...');
    // this.router.navigate(['/puzzles']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

