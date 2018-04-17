import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Account } from 'selvera-api';
import { CcrDatabase } from '../../../../shared';
import { FetchAllAccountResponse } from '../../../../shared/selvera-api';
import { CoachesCriteria } from './coaches.criteria';

@Injectable()
export class CoachesDatabase extends CcrDatabase {
  constructor(private account: Account) {
    super();
  }

  fetchAll(args: CoachesCriteria): Observable<FetchAllAccountResponse> {
    // validate organization and return empty if not passed
    if (!args.organization) {
      return Observable.of({} as FetchAllAccountResponse);
    }
    // observable of the API response
    return Observable.fromPromise(
      this.account.fetchAll({
        accountType: '2',
        organization: args.organization,
        offset: args.offset,
        order: args.order,
        direction: args.direction ? args.direction : undefined
      })
    );
  }
}
