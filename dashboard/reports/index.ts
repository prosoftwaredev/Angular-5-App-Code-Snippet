export * from './reports.component';
export * from './overview/overview.component';
export * from './alerts';
export * from './overview/enrollment-chart/enrollment-chart.component';
export * from './overview/signups-chart/signups-chart.component';

import { AlertsComponents, AlertsDatabase } from './alerts';
import { AlertsTableComponent } from './alerts/table/table.component';
import { EnrollmentChartComponent } from './overview/enrollment-chart/enrollment-chart.component';
import { OverviewComponent } from './overview/overview.component';
import { SignupsChartComponent } from './overview/signups-chart/signups-chart.component';
import { ReportsComponent } from './reports.component';

import { ReportsDatabase } from './services';

export const ReportsComponents = [
  ...AlertsComponents,
  EnrollmentChartComponent,
  SignupsChartComponent,
  OverviewComponent,
  ReportsComponent
];

export const ReportsProviders = [ReportsDatabase, AlertsDatabase];

export const ReportsEntryComponents = [];
