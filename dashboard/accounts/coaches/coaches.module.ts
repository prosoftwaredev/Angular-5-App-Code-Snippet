import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ClinicsModule } from '../clinics/clinics.module';

import { CoachesComponents, CoachesProviders } from './';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule, ClinicsModule],
  exports: CoachesComponents,
  declarations: CoachesComponents,
  providers: CoachesProviders
})
export class CoachesModule {}
