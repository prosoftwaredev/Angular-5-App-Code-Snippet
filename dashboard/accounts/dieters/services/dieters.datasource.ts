import { MatPaginator, MatSort } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../service';
import { TableDataSource } from '../../../../shared';
import {
  FetchAllAccountObjectResponse,
  FetchAllAccountResponse
} from '../../../../shared/selvera-api';
import { DietersCriteria, DietersDirection, DietersOrder } from './dieters.criteria';
import { DietersDatabase } from './dieters.database';

export class DietersDataSource extends TableDataSource<
  FetchAllAccountObjectResponse,
  FetchAllAccountResponse,
  DietersCriteria
> {
  constructor(
    protected notify: NotifierService,
    protected database: DietersDatabase,
    private paginator?: MatPaginator,
    private sort?: MatSort
  ) {
    super();

    // listen the paginator events
    if (this.paginator) {
      this.addOptional(this.paginator.page, () => ({
        pageSize: this.paginator.pageSize,
        offset: this.paginator.pageIndex * this.paginator.pageSize
      }));
    }

    // listen the sorter events
    if (this.sort) {
      this.addOptional(this.sort.sortChange, () => ({
        order: this.sort.active as DietersOrder,
        direction: this.sort.direction as DietersDirection
      }));
    }
  }

  defaultData(): FetchAllAccountResponse {
    return {
      accounts: [],
      pagination: { next: null, prev: null }
    };
  }

  fetch(criteria): Observable<FetchAllAccountResponse> {
    return this.database.fetchAll(criteria);
  }

  mapResult(result: FetchAllAccountResponse) {
    // pagination handling
    this.total = result.pagination.next
      ? result.pagination.next + 1
      : this.criteria.offset + result.accounts.length;

    if (result.accounts.length === 0) {
      return [];
    }

    return this.criteria.pageSize
      ? result.accounts.slice(0, this.criteria.pageSize)
      : result.accounts;
  }
}
