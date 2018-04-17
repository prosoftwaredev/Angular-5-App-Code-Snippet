import { MatPaginator } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../service/notifier.service';
import { TableDataSource } from '../../../shared';
import {
  FetchAllThreadResponse,
  SingleThreadResponse
} from '../../../shared/selvera-api';
import { ThreadsCriteria } from './threads.criteria';
import { ThreadsDatabase } from './threads.database';

export class ThreadsDataSource extends TableDataSource<
  SingleThreadResponse,
  FetchAllThreadResponse,
  ThreadsCriteria
> {
  completed = false;

  constructor(
    protected notify: NotifierService,
    protected database: ThreadsDatabase,
    private paginator?: MatPaginator
  ) {
    super();

    // listen the paginator events
    if (this.paginator) {
      this.addOptional(this.paginator.page, () => ({
        pageSize: this.paginator.pageSize,
        offset: this.paginator.pageIndex * this.paginator.pageSize
      }));
    }
  }

  defaultData(): FetchAllThreadResponse {
    return {
      threads: [],
      pagination: { next: null, prev: null }
    };
  }

  fetch(criteria: ThreadsCriteria): Observable<FetchAllThreadResponse> {
    return this.database.fetchAll(criteria);
  }

  mapResult(result: FetchAllThreadResponse): SingleThreadResponse[] {
    // pagination handling
    this.total = result.pagination.next
      ? result.pagination.next + 1
      : this.criteria.offset + result.threads.length;

    this.completed = !result.pagination.next;

    if (result.threads.length === 0) {
      return [];
    }

    return this.criteria.pageSize
      ? result.threads.slice(0, this.criteria.pageSize)
      : result.threads;
  }
}
