import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./features/exodex/exodex-page.component').then(
        (m) => m.ExodexPageComponent
      ),
  },
  {
    path: 'planeta/:id',
    loadComponent: () =>
      import('./features/planet-detail/planet-detail-page.component').then(
        (m) => m.PlanetDetailPageComponent
      ),
  },
  {
    path: 'method/:name',
    loadComponent: () =>
      import('./features/method/method-page.component').then(
        (m) => m.MethodPageComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
