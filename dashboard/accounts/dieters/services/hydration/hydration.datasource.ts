import * as moment from 'moment-timezone';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../../service';
import { CcrDataSource } from '../../../../../shared';
import {
  GetHydrationSummaryRequest,
  HydrationSummaryResponse
} from '../../../../../shared/selvera-api';
import { HydrationDatabase } from './hydration.database';

export interface HydrationSummary extends HydrationSummaryResponse {
  dailyGoal: number;
}

export class HydrationDataSource extends CcrDataSource<
  HydrationSummary,
  HydrationSummaryResponse[],
  GetHydrationSummaryRequest
> {
  constructor(
    protected notify: NotifierService,
    protected database: HydrationDatabase,
    private dailyGoal: number
  ) {
    super();
  }

  defaultData(): HydrationSummaryResponse[] {
    return [];
  }

  fetch(criteria): Observable<HydrationSummaryResponse[]> {
    return this.database.fetchSummary(criteria);
  }

  mapResult(result: HydrationSummaryResponse[]): HydrationSummary[] {
    return result
      .filter(segment => moment(segment.date).isSameOrBefore(moment()))
      .map(segment => ({
        ...segment,
        dailyGoal: this.dailyGoal
          ? Math.round(segment.total * 100 / this.dailyGoal)
          : null
      }));
  }
}
