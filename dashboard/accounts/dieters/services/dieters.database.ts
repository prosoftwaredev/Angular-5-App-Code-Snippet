import { Injectable } from '@angular/core';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { Account } from 'selvera-api';
import { CcrDatabase } from '../../../../shared';
import { FetchAllAccountResponse } from '../../../../shared/selvera-api';
import { DietersCriteria } from './dieters.criteria';

@Injectable()
export class DietersDatabase extends CcrDatabase {
  constructor(private account: Account) {
    super();
  }

  fetchAll(args: DietersCriteria): Observable<FetchAllAccountResponse> {
    // validate organization and return empty if not passed
    if (!args.organization) {
      return Observable.of({} as FetchAllAccountResponse);
    }
    // observable of the API response
    return Observable.fromPromise(
      this.account.fetchAll({
        accountType: '3',
        organization: args.organization,
        offset: args.offset,
        order: args.order,
        direction: args.direction ? args.direction : undefined
      })
    );
  }
}
