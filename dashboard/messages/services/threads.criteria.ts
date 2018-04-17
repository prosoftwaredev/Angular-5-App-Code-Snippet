import { FetchAllThreadRequest } from '../../../shared/selvera-api';

export interface ThreadsCriteria extends FetchAllThreadRequest {
  accounts: Array<string>;
  offset: number;
  pageSize: number;
}
