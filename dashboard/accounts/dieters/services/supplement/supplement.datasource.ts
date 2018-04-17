import * as moment from 'moment-timezone';
import { Observable } from 'rxjs/Observable';
import { Supplement } from 'selvera-api';
import { NotifierService } from '../../../../../service';
import { CcrDataSource } from '../../../../../shared';
import {
  FetchSupplementSummaryRequest,
  FetchSupplementSummaryResponse,
  OrganizationSupplements
} from '../../../../../shared/selvera-api';
import { SupplementDatabase } from './supplement.database';

export type SupplementCriteria = FetchSupplementSummaryRequest & {
  organization: string;
};

export class SupplementDataSource extends CcrDataSource<
  any,
  FetchSupplementSummaryResponse,
  SupplementCriteria
> {
  supplements: Array<OrganizationSupplements> = [];
  columns: Array<string> = [];

  constructor(
    protected notify: NotifierService,
    protected database: SupplementDatabase,
    protected supplement: Supplement
  ) {
    super();
  }

  defaultData(): FetchSupplementSummaryResponse {
    return { summary: [] };
  }

  fetch(criteria: SupplementCriteria): Observable<FetchSupplementSummaryResponse> {
    if (criteria.organization) {
      this.supplement
        .fetchSupplementsFor(criteria.organization)
        .then(res => {
          this.supplements = res.data[0].supplements;
          this.columns = this.supplements.length
            ? [
                'date',
                ...this.supplements.map(s => s.supplement.fullName.split(' ').join('_'))
              ]
            : [];
        })
        .catch(err => this.notify.error(err));
    }
    return this.database.fetchSummary(criteria);
  }

  mapResult(result: FetchSupplementSummaryResponse) {
    if (!this.supplements.length) {
      return [];
    }

    const supplementArray = [];
    let i = 0;
    result.summary
      .filter(segment => moment(segment.date).isSameOrBefore(moment()))
      .forEach(s => {
        supplementArray[i] = {};
        supplementArray[i].date = s.date;
        s.consumption.forEach(c => {
          supplementArray[i][`${c.supplement.name.split(' ').join('_')}`] = c.quantity;
        });
        i++;
      });

    return supplementArray;
  }
}
