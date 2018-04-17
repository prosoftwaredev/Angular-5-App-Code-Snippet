import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../../service';
import { CcrDataSource } from '../../../../../shared';
import {
  FetchActivityRequest,
  FetchActivityResponse
} from '../../../../../shared/selvera-api';
import { MeasurementDatabase } from './measurement.database';

export class ActivityDataSource extends CcrDataSource<
  FetchActivityResponse,
  FetchActivityResponse[],
  FetchActivityRequest
> {
  constructor(
    protected notify: NotifierService,
    protected database: MeasurementDatabase
  ) {
    super();
  }

  defaultData(): FetchActivityResponse[] {
    return [];
  }

  fetch(criteria: FetchActivityRequest): Observable<FetchActivityResponse[]> {
    return Observable.fromPromise(this.database.fetchActivity(criteria));
  }

  mapResult(result: FetchActivityResponse[]): FetchActivityResponse[] {
    return result;
  }
}
