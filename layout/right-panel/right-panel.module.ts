import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from './../../shared/shared.module';

import { Components, EntryComponents, Providers, RightPanelComponent } from './';

@NgModule({
  imports: [CommonModule, SharedModule],
  exports: [RightPanelComponent],
  declarations: Components,
  entryComponents: EntryComponents,
  providers: [...Providers]
})
export class RightPanelModule {}
