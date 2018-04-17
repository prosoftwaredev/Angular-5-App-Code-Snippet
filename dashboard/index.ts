export * from './accounts';
export * from './messages';
export * from './resources';
export * from './profile';
export * from './reports';

import { AccountComponents, AccountEntryComponents, AccountProviders } from './accounts';
import {
  ProfileComponents,
  ProfileEntryComponents,
  UserProfileProviders
} from './profile';
import { ResourcesComponents, ResourcesEntryComponents } from './resources';

export const DashboardComponents = [
  ...AccountComponents,
  ...ResourcesComponents,
  ...ProfileComponents
];

export const DashboardEntryComponents = [
  ...AccountEntryComponents,
  ...ResourcesEntryComponents,
  ...ProfileEntryComponents
];

export const DashboardProviders = [...AccountProviders, ...UserProfileProviders];
