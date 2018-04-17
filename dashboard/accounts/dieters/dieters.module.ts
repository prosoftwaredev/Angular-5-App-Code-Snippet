import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

import { DietersComponents, DietersEntryComponents, DietersProviders } from './';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  exports: DietersComponents,
  declarations: DietersComponents,
  providers: DietersProviders,
  entryComponents: DietersEntryComponents
})
export class DietersModule {}
