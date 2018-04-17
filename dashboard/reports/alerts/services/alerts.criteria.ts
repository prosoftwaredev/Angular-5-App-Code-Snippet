import { NotificationRequest } from '../../../../shared/selvera-api/';

// export type CoachesOrder = 'name' | 'email' | 'created';
// export type CoachesDirection = 'asc' | 'desc';

export interface AlertsCriteria extends NotificationRequest {
  organization: string;
  alertType: Array<string> | undefined;
}
