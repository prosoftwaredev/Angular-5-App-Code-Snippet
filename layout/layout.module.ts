import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LayoutRoutes } from './layout.routing';
import { RightPanelModule } from './right-panel/right-panel.module';

import { LayoutComponent, LayoutComponents } from './';

@NgModule({
  imports: [CommonModule, SharedModule, RightPanelModule, LayoutRoutes],
  exports: [RouterModule, LayoutComponent],
  declarations: LayoutComponents
})
export class LayoutModule {}
