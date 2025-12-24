import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/terminal-login/terminal-login.component').then(
        (m) => m.TerminalLoginComponent
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/auth/welcome/welcome.component').then(
        (m) => m.WelcomeComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'game',
    loadChildren: () =>
      import('./features/game/game.routes').then((m) => m.gameRoutes),
    canActivate: [authGuard],
  },
  // Future routes for puzzles
  // {
  //   path: 'puzzles',
  //   loadChildren: () =>
  //     import('./features/puzzle/puzzle.routes').then((m) => m.routes),
  //   canActivate: [authGuard],
  // },
  {
    path: '**',
    redirectTo: '',
  },
];
