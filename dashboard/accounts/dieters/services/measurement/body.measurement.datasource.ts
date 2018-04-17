import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../../service';
import { CcrDataSource } from '../../../../../shared';
import {
  FetchBodyMeasurementRequest,
  FetchBodyMeasurementResponse
} from '../../../../../shared/selvera-api';
import { MeasurementDatabase } from './measurement.database';

export class BodyMeasurementDataSource extends CcrDataSource<
  FetchBodyMeasurementResponse,
  FetchBodyMeasurementResponse[],
  FetchBodyMeasurementRequest
> {
  constructor(
    protected notify: NotifierService,
    protected database: MeasurementDatabase
  ) {
    super();
  }

  defaultData(): FetchBodyMeasurementResponse[] {
    return [];
  }

  fetch(criteria): Observable<FetchBodyMeasurementResponse[]> {
    return Observable.fromPromise(this.database.fetchBodyMeasurement(criteria));
  }

  mapResult(result: FetchBodyMeasurementResponse[]) {
    return result;
  }
}
