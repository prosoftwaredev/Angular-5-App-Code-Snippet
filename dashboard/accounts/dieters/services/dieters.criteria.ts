import { FetchAllAccountRequest } from '../../../../shared/selvera-api';

export type DietersDirection = 'asc' | 'desc';
export type DietersOrder = 'name' | 'email' | 'created';

export interface DietersCriteria extends FetchAllAccountRequest {
  organization: number;
  pageSize: number;
}
