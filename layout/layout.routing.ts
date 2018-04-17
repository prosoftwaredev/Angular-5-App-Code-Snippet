import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: 'app/dashboard/dashboard.module#DashboardModule' }
];

export const LayoutRoutes = RouterModule.forChild(routes);
