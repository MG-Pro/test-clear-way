import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/viewer/viewer.routes').then((m) => m.viewerRoutes),
  },
];
