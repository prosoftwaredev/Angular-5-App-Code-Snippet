import { MatPaginator, MatSort } from '@angular/material';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { NotifierService } from '../../../../service/notifier.service';
import { TableDataSource } from '../../../../shared';
import { NotificationRequest, ReportNotification } from '../../../../shared/selvera-api';
import { AlertsCriteria, AlertsDatabase } from './';

export class AlertsDataSource extends TableDataSource<
  ReportNotification,
  ReportNotification[],
  AlertsCriteria
> {
  constructor(
    protected notify: NotifierService,
    protected database: AlertsDatabase,
    private paginator?: MatPaginator,
    private sort?: MatSort
  ) {
    super();
  }

  defaultData(): any {
    return [];
  }

  fetch(criteria: NotificationRequest): Observable<Array<ReportNotification>> {
    const request: NotificationRequest = {
      // account: '1090',
      organization: '1'
    };
    return this.database.fetchNotifications(request);
  }

  mapResult(result: Array<ReportNotification>): any {
    const filterTypes = this.criteria.alertType;
    if (filterTypes && filterTypes.length) {
      result = result.filter(v => filterTypes.indexOf(v.type.id) >= 0);
    }

    const filterOrg = this.criteria.organization;
    if (filterOrg) {
      result = result.filter(v => v.organization.id === filterOrg);
    }

    return result.map(value => {
      const alert = {
        detail: '',
        params: {}
      };
      let icon = 'tracker';
      const now = moment();
      let since: moment.Moment;

      switch (value.type.code) {
        case 'no_tape_measurements':
          since = moment(value.payload.lastMeasurement);
          alert.detail = 'No tape measurement ' + since.to(now);
          icon = 'tape';
          break;

        case 'no_weigh_ins':
          since = moment(value.payload.lastMeasurement);
          alert.detail = 'No weigh-ins ' + since.to(now);
          icon = 'scale-inline';
          break;

        case 'weight_regained':
          alert.detail = value.payload.percentage + '% weight regained';
          icon = 'scale';
          break;
      }

      return {
        triggeredBy: value.triggeredBy,
        alertCode: value.type.code,
        alertDescription: value.type.description,
        ...alert,
        icon: `./assets/svg/${icon}.svg`
      };
    });
  }
}
