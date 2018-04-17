export * from './clinics.component';
export * from './services';
export * from './table/picker/picker.component';

import { ClinicsComponent } from './clinics.component';
import { ClinicsDatabase } from './services';
import { ClinicsPickerComponent } from './table/picker/picker.component';
import { ClinicsTableComponent } from './table/table.component';

export const ClinicsComponents = [
  ClinicsComponent,
  ClinicsPickerComponent,
  ClinicsTableComponent
];

export const ClinicsEntryComponents = [];

export const ClinicsProviders = [ClinicsDatabase];
