export * from './dieters.component';
export * from './form/dieter.component';
export * from './services';

export * from './dieter/dieter.component';
export * from './dieter/dashboard/dashboard.component';
export * from './dieter/journal/journal.component';
export * from './dieter/profile/profile.component';
export * from './dieter/measurements/measurements.component';
export * from './dieter/messages/messages.component';

import { DieterDashboardComponent } from './dieter/dashboard/dashboard.component';
import { StatDiffComponent } from './dieter/dashboard/stat-diff/stat-diff.component';
import { StatSingleComponent } from './dieter/dashboard/stat-single/stat-single.component';
import { DieterComponent } from './dieter/dieter.component';
import { JournalComponents, JournalEntryComponents } from './dieter/journal';
import { MeasurementComponents, MeasurementEntryComponents } from './dieter/measurements';
import { DieterMessagesComponent } from './dieter/messages/messages.component';
import { DieterProfileComponent } from './dieter/profile/profile.component';
import { DietersComponent } from './dieters.component';
import { DieterFormComponent } from './form/dieter.component';
import {
  DieterDataService,
  DietersDatabase,
  FoodDatabase,
  GoalsResolver,
  HydrationDatabase,
  MeasurementDatabase,
  SupplementDatabase,
  UserDashboardDatabase
} from './services';
import { DietersTableComponent } from './table/table.component';

export const DietersComponents = [
  StatDiffComponent,
  StatSingleComponent,
  DietersComponent,
  DietersTableComponent,
  DieterComponent,
  DieterFormComponent,
  DieterDashboardComponent,
  DieterMessagesComponent,
  DieterProfileComponent,
  ...JournalComponents,
  ...MeasurementComponents
];

export const DietersEntryComponents = [
  ...JournalEntryComponents,
  ...MeasurementEntryComponents
];

export const DietersProviders = [
  DieterDataService,
  DietersDatabase,
  FoodDatabase,
  GoalsResolver,
  HydrationDatabase,
  MeasurementDatabase,
  SupplementDatabase,
  UserDashboardDatabase
];
