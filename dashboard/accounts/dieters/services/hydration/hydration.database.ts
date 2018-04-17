import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import { Hydration } from 'selvera-api';
import { CcrDatabase } from '../../../../../shared';
import { GetHydrationSummaryRequest } from '../../../../../shared/selvera-api';

@Injectable()
export class HydrationDatabase extends CcrDatabase {
  constructor(private hydration: Hydration) {
    super();
  }

  fetchSummary(args: GetHydrationSummaryRequest): Observable<any> {
    return Observable.fromPromise(
      this.hydration.fetchSummary({
        startDate: args.startDate,
        endDate: args.endDate,
        unit: args.unit,
        account: args.account
      })
    );
  }
}
