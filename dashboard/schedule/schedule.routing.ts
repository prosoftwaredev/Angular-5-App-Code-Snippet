import { Routes } from '@angular/router';
import {
  ScheduleAvailabilityComponent,
  ScheduleAvailabilityRecurringComponent,
  ScheduleAvailabilitySingleDayComponent,
  ScheduleCalendarComponent
} from './';

export const ScheduleRoutes: Routes = [
  {
    path: 'view',
    component: ScheduleCalendarComponent
  },
  {
    path: 'available',
    component: ScheduleAvailabilityComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'recurring' },
      { path: 'recurring', component: ScheduleAvailabilityRecurringComponent },
      { path: 'single', component: ScheduleAvailabilitySingleDayComponent }
    ]
  }
];
