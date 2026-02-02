import { Routes } from '@angular/router';

export const viewerRoutes: Routes = [{ path: ':id', loadComponent: () => import('./viewer').then((m) => m.Viewer) }];
