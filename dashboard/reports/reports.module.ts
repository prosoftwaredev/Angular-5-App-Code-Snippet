import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReportsComponents, ReportsEntryComponents, ReportsProviders } from './';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  declarations: ReportsComponents,
  entryComponents: ReportsEntryComponents,
  exports: ReportsComponents,
  providers: ReportsProviders
})
export class ReportsModule {}
