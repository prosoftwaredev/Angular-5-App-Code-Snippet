import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Reports } from 'selvera-api';
import { CcrDatabase } from '../../../../shared';
import { NotificationRequest, ReportNotification } from '../../../../shared/selvera-api';

@Injectable()
export class AlertsDatabase extends CcrDatabase {
  constructor(private reports: Reports) {
    super();
  }

  fetchNotifications(args: NotificationRequest): Observable<Array<ReportNotification>> {
    // FIXME the existing test records
    const params = {
      account: '1867',
      organization: '31'
    };
    return Observable.fromPromise(this.reports.fetchNotifications(params));
  }
}
