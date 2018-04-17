export * from './availability/schedule-availability.component';
export * from './calendar/schedule-calendar.component';

import { ScheduleAvailabilityRecurringComponent } from './availability/recurring/recurring.component';
import { ScheduleAvailabilityComponent } from './availability/schedule-availability.component';
import { ScheduleAvailabilitySingleDayComponent } from './availability/single-day/single-day.component';
import { ScheduleCalendarComponent } from './calendar/schedule-calendar.component';
import { RecurringAddDialog } from './dialogs/recurring-add.dialog';
import { SingleAddDialog } from './dialogs/single-add.dialog';

export const ScheduleComponents = [
  ScheduleAvailabilityComponent,
  ScheduleAvailabilityRecurringComponent,
  ScheduleAvailabilitySingleDayComponent,
  ScheduleCalendarComponent,
  SingleAddDialog,
  RecurringAddDialog
];

export const ScheduleEntryComponents = [SingleAddDialog, RecurringAddDialog];

export const ScheduleProviders = [];

export {
  ScheduleCalendarComponent,
  ScheduleAvailabilityComponent,
  ScheduleAvailabilityRecurringComponent,
  ScheduleAvailabilitySingleDayComponent
};
