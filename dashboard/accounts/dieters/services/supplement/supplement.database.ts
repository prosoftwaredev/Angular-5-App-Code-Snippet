import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Supplement } from 'selvera-api';
import { CcrDatabase } from '../../../../../shared/index';
import {
  FetchSupplementSummaryRequest,
  FetchSupplementSummaryResponse
} from '../../../../../shared/selvera-api';

@Injectable()
export class SupplementDatabase extends CcrDatabase {
  constructor(private supplement: Supplement) {
    super();
  }

  fetchSummary(
    args: FetchSupplementSummaryRequest
  ): Observable<FetchSupplementSummaryResponse> {
    return Observable.fromPromise(this.supplement.fetchSummary(args));
  }
}
