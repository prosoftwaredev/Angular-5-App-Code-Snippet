import { Routes } from '@angular/router';
import { AlertsComponent, OverviewComponent, ReportsComponent } from './';

export const ReportsRoutes: Routes = [
  {
    path: '',
    component: ReportsComponent
  },
  {
    path: 'overview',
    component: OverviewComponent
  },
  {
    path: 'alerts',
    component: AlertsComponent
  }
];
