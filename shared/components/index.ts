export * from './messages/messages.interfaces';

import { CcrAvatarComponent } from './avatar/avatar.component';
import { CcrBadgeComponent } from './badge/badge.component';
import {
  DateNavigator,
  DateNavigatorOutput
} from './date-navigator/date-navigator.component';
import {
  DateRangeNavigator,
  DateRangeNavigatorOutput
} from './date-range/date-range.component';
import { MatMomentDateModule } from './datepicker/moment-adapter';
import { CcrMessagesComponent } from './messages/messages.component';
import { CcrPaginator } from './paginator/paginator.component';
import { ProgressCircle } from './progress-circle/progress-circle.component';
import { CcrSelectUserComponent } from './select-user/select-user.component';

export {
  DateNavigator,
  DateNavigatorOutput,
  DateRangeNavigator,
  DateRangeNavigatorOutput,
  CcrAvatarComponent,
  CcrBadgeComponent,
  CcrMessagesComponent,
  CcrPaginator,
  CcrSelectUserComponent,
  ProgressCircle,
  MatMomentDateModule
};

export const CmpComponents = [
  DateNavigator,
  DateRangeNavigator,
  CcrAvatarComponent,
  CcrBadgeComponent,
  CcrMessagesComponent,
  CcrPaginator,
  CcrSelectUserComponent,
  ProgressCircle
];

export const CmpEntryComponents = [];
