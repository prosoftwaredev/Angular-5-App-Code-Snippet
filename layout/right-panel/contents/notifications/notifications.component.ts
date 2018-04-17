import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { ConfigService, NotifierService } from '../../../../service';
import { FetchAllMeetingRequest } from '../../../../shared/selvera-api';
import { NotificationsDataService } from '../../services';

@Component({
  selector: 'app-rightpanel-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  dateSections: Array<any> = [];
  isLoading = true;

  constructor(
    private config: ConfigService,
    private notifier: NotifierService,
    private dataService: NotificationsDataService
  ) {}

  ngOnInit() {
    this.getMeetings();
  }

  private getMeetings(): void {
    this.dataService
      .getUser()
      .then(user => {
        const request: FetchAllMeetingRequest = {
          accounts: [user.id],
          startTimeBegin: moment().format('YYYY-MM-DD')
        };
        this.dataService
          .getMeetings(request)
          .then(res => {
            this.dateSections = this.dataService.groupByDate(
              res,
              null,
              this.config.get('app.limit.notifications', 12)
            );
            this.isLoading = false;
          })
          .catch(err => this.notifier.error(err));
      })
      .catch(err => this.notifier.error(err));
  }
}
