import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const gameRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./game-view/game-view.component').then((m) => m.GameViewComponent),
    canActivate: [authGuard],
  },
];

