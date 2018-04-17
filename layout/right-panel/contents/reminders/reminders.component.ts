import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as moment from 'moment-timezone';
import { Organization } from 'selvera-api';
import {
  ConfigService,
  ContextService,
  EventsService,
  NotifierService
} from '../../../../service';
import {
  ConsultationListingRequest,
  ConsultationListingResponse,
  FetchAllMeetingRequest
} from '../../../../shared/selvera-api';
import { AddNoteDialog } from '../../dialogs';
import { ConsultationsDataService, NotificationsDataService } from '../../services';

@Component({
  selector: 'app-rightpanel-reminders',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.scss']
})
export class RemindersComponent implements OnInit {
  isLoading = true;
  isScheduleEnabled = false;

  dateSections: Array<any> = [];
  notes: Array<ConsultationListingResponse> = [];

  constructor(
    private dialog: MatDialog,
    private organization: Organization,
    private config: ConfigService,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private dataService: NotificationsDataService,
    private consultationsService: ConsultationsDataService
  ) {}

  ngOnInit() {
    // FIXME context must be filled on APP_INITIALIZATION
    if (this.context.organizationId) {
      this.organization.getSchedulePreferences(this.context.organizationId).then(res => {
        this.isScheduleEnabled = !res.sectionDisabled;
        if (this.isScheduleEnabled) {
          this.getMeetings();
        }
      });
    }
    this.getNotes();
  }

  private getMeetings(): void {
    this.dataService
      .getUser()
      .then(user => {
        const request: FetchAllMeetingRequest = {
          accounts: [this.context.dieterId],
          startTimeBegin: moment().format('YYYY-MM-DD')
        };
        this.dataService
          .getMeetings(request)
          .then(res => {
            this.dateSections = this.dataService.groupByDate(
              res,
              'LL',
              this.config.get('app.limit.reminders', 3)
            );
            this.isLoading = false;
          })
          .catch(err => this.notifier.error(err));
      })
      .catch(err => this.notifier.error(err));
  }

  private getNotes(): void {
    const request: ConsultationListingRequest = {
      clientId: this.context.dieterId,
      startDate: moment()
        .subtract(1, 'years')
        .format()
    };
    this.consultationsService
      .getNotes(request)
      .then(res => {
        this.notes = res;
        this.isLoading = false;
      })
      .catch(err => this.notifier.error(err));
  }

  showNoteDialog(): void {
    const dialog = this.dialog.open(AddNoteDialog, {
      width: '400px',
      disableClose: true,
      data: {
        accountType: 'dieter'
      }
    });
    dialog.afterClosed().subscribe(result => {
      this.getNotes();
    });
  }
}
