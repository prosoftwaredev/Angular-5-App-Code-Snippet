import { Routes } from '@angular/router';
import {
  CoachComponent,
  CoachesComponent,
  CoachProfileComponent,
  CoachScheduleComponent
} from './';

export const CoachesRoutes: Routes = [
  { path: '', pathMatch: 'full', component: CoachesComponent },
  {
    path: ':id',
    component: CoachComponent,
    children: [
      { path: '', redirectTo: 'profile' },
      { path: 'profile', component: CoachProfileComponent },
      { path: 'schedule', component: CoachScheduleComponent }
    ]
  }
];
