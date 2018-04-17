export * from './alerts.component';
export * from './services';
export * from './table/table.component';

import { AlertsComponent } from './alerts.component';
import { AlertsDatabase } from './services';
import { AlertsTableComponent } from './table/table.component';

export const AlertsComponents = [AlertsComponent, AlertsTableComponent];
