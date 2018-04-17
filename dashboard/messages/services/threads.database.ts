import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Message } from 'selvera-api';
import { CcrDatabase } from '../../../shared';
import { FetchAllThreadResponse } from '../../../shared/selvera-api';
import { ThreadsCriteria } from './threads.criteria';

@Injectable()
export class ThreadsDatabase extends CcrDatabase {
  constructor(private message: Message) {
    super();
  }

  fetchAll(args: ThreadsCriteria): Observable<FetchAllThreadResponse> {
    // validate accounts and return empty if not passed
    if (!args.accounts) {
      return Observable.of({} as FetchAllThreadResponse);
    }
    const accounts = args.accounts.sort((x, y) => Number(x) - Number(y));
    // observable of the API response
    return Observable.fromPromise(
      this.message.fetchAllThreads({
        accounts: accounts,
        offset: args.offset,
        accountsExclusive: args.accounts.length > 1 ? true : false
      })
    );
  }
}
