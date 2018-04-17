import { Routes } from '@angular/router';
import {
  DieterComponent,
  DieterDashboardComponent,
  DieterJournalComponent,
  DieterMeasurementsComponent,
  DieterMessagesComponent,
  DieterProfileComponent,
  DietersComponent,
  GoalsResolver
} from './';

export const DietersRoutes: Routes = [
  {
    path: '',
    component: DietersComponent
  },
  {
    path: ':id',
    component: DieterComponent,
    resolve: {
      goals: GoalsResolver
    },
    children: [
      { path: '', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DieterDashboardComponent },
      { path: 'profile', component: DieterProfileComponent },
      { path: 'journal', component: DieterJournalComponent },
      { path: 'measurements', component: DieterMeasurementsComponent },
      { path: 'messages', component: DieterMessagesComponent }
    ]
  }
];
