import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ScheduleComponents, ScheduleEntryComponents, ScheduleProviders } from './';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  exports: ScheduleComponents,
  declarations: ScheduleComponents,
  providers: ScheduleProviders,
  entryComponents: ScheduleEntryComponents
})
export class ScheduleModule {}

// export function ScheduleEntrypoint() {
//   return ScheduleModule;
// }
