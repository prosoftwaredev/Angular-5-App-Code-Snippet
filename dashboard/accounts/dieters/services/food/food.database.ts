import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import { Food } from 'selvera-api';
import { _, CcrDatabase } from '../../../../../shared';
import {
  FetchAllConsumedRequest,
  FetchAllConsumedResponse
} from '../../../../../shared/selvera-api';

@Injectable()
export class FoodDatabase extends CcrDatabase {
  constructor(private food: Food) {
    super();
  }

  fetchAll(args: FetchAllConsumedRequest): Observable<FetchAllConsumedResponse> {
    return Observable.fromPromise(
      this.food.fetchAllConsumed({
        account: args.account,
        noLimit: args.noLimit,
        startDate: args.startDate,
        endDate: args.endDate
      })
    );
  }
}
