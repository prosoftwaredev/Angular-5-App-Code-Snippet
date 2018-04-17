import { DataCriteria } from '../../../../shared';

export interface ClinicCriteria extends DataCriteria {
  name?: string; // name filter
  admin?: boolean; // with admin permissions
  accessall?: boolean; // with access permissions
  offset?: number;
  order?: string;
  direction?: string;
}
