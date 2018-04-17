export * from './profile.component';
export * from './form/form.component';

import { FormComponent as ProfileFormComponent } from './form/form.component';
import { ProfileComponent } from './profile.component';
import { ProfileDataService } from './services/data.service';

export const ProfileComponents = [
  ProfileComponent,
  ProfileFormComponent
];

export const UserProfileProviders = [
	ProfileDataService
];

export const ProfileEntryComponents = [
];
