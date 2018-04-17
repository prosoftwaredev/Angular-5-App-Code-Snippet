import { MatPaginator, MatSort } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../service';
import { TableDataSource } from '../../../../shared';
import { FetchCoachAssociationResponse } from '../../../../shared/selvera-api';
import { ClinicCriteria } from './clinics.criteria';
import { ClinicsDatabase } from './clinics.database';

export class ClinicsDataSource extends TableDataSource<
  FetchCoachAssociationResponse,
  FetchCoachAssociationResponse[],
  ClinicCriteria
> {
  constructor(
    protected notify: NotifierService,
    protected database: ClinicsDatabase,
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
        order: this.sort.active,
        direction: this.sort.direction
      }));
    }
  }

  defaultData(): FetchCoachAssociationResponse[] {
    return [];
  }

  fetch(): Observable<FetchCoachAssociationResponse[]> {
    return this.database.fetch();
  }

  mapResult(result: FetchCoachAssociationResponse[]) {
    // apply permissions filters if needed
    if (this.criteria.admin) {
      result = result.filter(c => c.permissionAdmin);
    }
    if (this.criteria.accessall) {
      result = result.filter(c => c.permissionAccessAll);
    }

    // apply the filter if needed because the API doesn't filter by itself
    if (this.criteria.name) {
      result = result.filter(item => {
        const searchStr = item.organizationName.toLowerCase();
        return searchStr.indexOf(this.criteria.name.toLowerCase()) !== -1;
      });
    }

    return result;
  }
}
