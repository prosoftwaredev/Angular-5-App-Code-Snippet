import { FetchAllAccountRequest } from '../../../../shared/selvera-api/';

export type CoachesOrder = 'name' | 'email' | 'created';
export type CoachesDirection = 'asc' | 'desc';

export interface CoachesCriteria extends FetchAllAccountRequest {
  organization: number;
}
