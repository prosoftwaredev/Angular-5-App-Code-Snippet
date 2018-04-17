import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ClinicsModule } from './accounts/clinics/clinics.module';
import { CoachesModule } from './accounts/coaches/coaches.module';
import { DietersModule } from './accounts/dieters/dieters.module';
import { DashboardRoutes } from './dashboard.routing';
import { MessagesModule } from './messages/messages.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from './schedule/schedule.module';

import { DashboardComponents, DashboardEntryComponents, DashboardProviders } from './';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ClinicsModule,
    CoachesModule,
    DietersModule,
    MessagesModule,
    ScheduleModule,
    DashboardRoutes,
    ReportsModule
  ],
  exports: [RouterModule],
  declarations: DashboardComponents,
  entryComponents: DashboardEntryComponents,
  providers: DashboardProviders
})
export class DashboardModule {}

export function DashboardEntrypoint() {
  return DashboardModule;
}
