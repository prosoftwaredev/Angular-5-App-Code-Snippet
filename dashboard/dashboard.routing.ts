import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../service';
import {
  ClinicsComponent,
  FaqsComponent,
  MarketingComponent,
  ProfileComponent,
  ReportsComponent,
  SupportComponent
} from './';
import { CoachesRoutes } from './accounts/coaches/coaches.routing';
import { DietersRoutes } from './accounts/dieters/dieters.routing';
import { MessagesRoutes } from './messages/messages.routing';
import { ReportsRoutes } from './reports/reports.routing';
import { ScheduleRoutes } from './schedule/schedule.routing';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'accounts/patients' },
      {
        path: 'accounts/patients',
        children: DietersRoutes
      },
      {
        path: 'accounts/coaches',
        children: CoachesRoutes
      },
      {
        path: 'accounts/clinics',
        component: ClinicsComponent
      },
      {
        path: 'schedule',
        children: ScheduleRoutes
      },
      {
        path: 'messages',
        children: MessagesRoutes
      },
      {
        path: 'reports',
        children: ReportsRoutes
      },
      { path: 'profile', component: ProfileComponent },
      { path: 'resources/support', component: SupportComponent },
      { path: 'resources/marketing', component: MarketingComponent },
      { path: 'resources/faqs', component: FaqsComponent },
    ]
  }
];

export const DashboardRoutes = RouterModule.forChild(routes);
