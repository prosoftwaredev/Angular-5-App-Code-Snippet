import { MatPaginator, MatSort } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../service/notifier.service';
import { TableDataSource } from '../../../../shared';
import {
  FetchAllAccountObjectResponse,
  FetchAllAccountResponse
} from '../../../../shared/selvera-api';
import { CoachesCriteria, CoachesDirection, CoachesOrder } from './coaches.criteria';
import { CoachesDatabase } from './coaches.database';

export class CoachesDataSource extends TableDataSource<
  FetchAllAccountObjectResponse,
  FetchAllAccountResponse,
  CoachesCriteria
> {
  constructor(
    protected notify: NotifierService,
    protected database: CoachesDatabase,
    private paginator?: MatPaginator,
    private sort?: MatSort
  ) {
    super();

    // listen the paginator events
    if (this.paginator) {
      this.addOptional(this.paginator.page, () => ({
        offset: this.paginator.pageIndex * this.paginator.pageSize
      }));
    }

    // listen the sorter events
    if (this.sort) {
      this.addOptional(this.sort.sortChange, () => ({
        order: this.sort.active as CoachesOrder,
        direction: this.sort.direction as CoachesDirection
      }));
    }
  }

  defaultData(): FetchAllAccountResponse {
    return {
      accounts: [],
      pagination: { next: null, prev: null }
    };
  }

  fetch(criteria: CoachesCriteria): Observable<FetchAllAccountResponse> {
    return this.database.fetchAll(criteria);
  }

  mapResult(result: FetchAllAccountResponse): FetchAllAccountObjectResponse[] {
    // pagination handling
    this.total = result.pagination.next
      ? result.pagination.next + 1
      : this.criteria.offset + result.accounts.length;

    return result.accounts;
  }
}
