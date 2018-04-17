import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../../service';
import { CcrDataSource } from '../../../../../shared';
import {
  BodySummaryDataResponseSegment,
  FetchBodySummaryRequest,
  FetchBodySummaryResponse
} from '../../../../../shared/selvera-api';
import { MeasurementDatabase } from './measurement.database';

export class BodySummaryDataSource extends CcrDataSource<
  BodySummaryDataResponseSegment,
  FetchBodySummaryResponse,
  FetchBodySummaryRequest
> {
  constructor(
    protected notify: NotifierService,
    protected database: MeasurementDatabase
  ) {
    super();
  }

  defaultData(): FetchBodySummaryResponse {
    return {
      data: [],
      summary: {}
    };
  }

  fetch(): Observable<FetchBodySummaryResponse> {
    return Observable.fromPromise(this.database.fetchBodySummary(this.criteria));
  }

  mapResult(result: FetchBodySummaryResponse): BodySummaryDataResponseSegment[] {
    return result.data;
  }
}
