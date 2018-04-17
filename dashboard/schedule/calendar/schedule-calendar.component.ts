import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { isEmpty } from 'lodash';
import * as moment from 'moment-timezone';
import 'rxjs/add/operator/zip';
import { Observable } from 'rxjs/Observable';
import { Schedule } from 'selvera-api';
import { ContextService, EventsService } from '../../../service';
import { DateNavigatorOutput } from '../../../shared';
import {
  FetchAllAccountObjectResponse,
  FetchCalendarAvailabilitySegment,
  FetchMeetingResponse,
  Profile
} from '../../../shared/selvera-api';

export interface TimeBlock {
  display: string;
  duration: number;
  time: Date;
  cells: {
    isAvailable: boolean;
    meeting: Meeting;
  }[];
}

export type Meeting = FetchMeetingResponse & {
  timeToDisplay: string;
};

@Component({
  selector: 'app-schedule-calendar',
  templateUrl: './schedule-calendar.component.html',
  styleUrls: ['./schedule-calendar.component.scss']
})
export class ScheduleCalendarComponent implements OnInit, AfterViewChecked {
  @ViewChild('tbody') tbody: ElementRef;
  @ViewChildren('trow') rows: ElementRef[];

  public days: Array<string> = [moment().format('ddd D')];
  public startDate: any = moment().set({ hours: 0, minutes: 0, seconds: 0 });
  public timeBlocks: Array<TimeBlock> = [];
  public timerange: 'day' | 'week' = 'week';
  public selectedMeeting = 0;
  public dates: DateNavigatorOutput = {};

  private selectedUser: Profile | FetchAllAccountObjectResponse;
  private isTableScrolled = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private schedule: Schedule,
    private context: ContextService,
    private bus: EventsService
  ) {}

  public ngOnInit(): void {
    this.context.selected$.subscribe(user => {
      if (user) {
        this.selectedUser = user;
        this.getMeetings(this.dates);
      }
    });
    this.generateTimes([], []);

    this.bus.trigger('right-panel.component.set', 'addConsultation');
    this.bus.trigger('right-panel.consultation.form', {
      form: 'addConsultation'
    });
    this.bus.register('schedule.table.selected', this.setSelected.bind(this));
    this.bus.register('schedule.table.refresh', () => {
      this.getMeetings(this.dates);
    });
  }

  public ngAfterViewChecked(): void {
    if (this.rows.length === 96 && !this.isTableScrolled) {
      this.isTableScrolled = true;
      this.tbody.nativeElement.scrollTop =
        this.rows.find(r => r.nativeElement.className === 'eight-am-row').nativeElement
          .offsetTop - 32;
    }
  }

  public ngOnDestroy() {
    this.bus.unregister('schedule.table.refresh');
  }

  public setSelected(value: number) {
    this.selectedMeeting = value;
  }

  public selectMeeting(id: number) {
    if (this.selectedMeeting !== id) {
      // TODO force showing on mobile with an event
      this.bus.trigger('right-panel.consultation.form', {
        form: 'editConsultation',
        id: id
      });
      this.selectedMeeting = id;
    }
  }

  public calculateTop(meeting: Meeting): number {
    const minutes = moment(meeting.startTime).minutes() % 15;
    return minutes * 100 / 15;
  }

  public calculateHeight(meeting: Meeting): number {
    const diff = moment(meeting.endTime).diff(moment(meeting.startTime), 'minutes');
    return diff * 24.8 / 15;
  }

  private generateTimes(
    meetings: Meeting[],
    availabilities: FetchCalendarAvailabilitySegment[]
  ): void {
    this.timeBlocks.length = 0;
    const startDate = !isEmpty(this.dates)
      ? moment(this.dates.startDate).startOf('day')
      : this.startDate;

    while (this.timeBlocks.length < 96) {
      const time =
        this.timeBlocks.length === 0
          ? startDate.toDate()
          : moment(this.timeBlocks[this.timeBlocks.length - 1].time)
              .add(15, 'minutes')
              .toDate();

      const block = {
        display: moment(time).format('h:mm A'),
        duration: 15,
        time: time,
        cells: new Array<{
          isAvailable: boolean;
          meeting: Meeting;
        }>()
      };

      for (let i = 0; i < (this.timerange === 'day' ? 1 : 7); i++) {
        block.cells.push({
          isAvailable: availabilities.some(
            segment =>
              moment(time)
                .add(i, 'days')
                .isBetween(segment.startTime, segment.endTime, null, '[]') &&
              moment(time)
                .add(i, 'days')
                .add(15, 'minutes')
                .isBetween(segment.startTime, segment.endTime, null, '[]')
          ),
          meeting: null
        });
      }

      meetings.forEach(meeting => {
        const minuteDiff = moment(meeting.startTime).minutes() - moment(time).minutes();
        if (
          moment(meeting.startTime).hour() === moment(time).hour() &&
          minuteDiff >= 0 &&
          minuteDiff < 15
        ) {
          const index = this.days.findIndex(
            day => day === moment(meeting.startTime).format('ddd D')
          );
          if (index > -1) {
            block.cells[index].meeting = meeting;
          }
        }
      });
      this.timeBlocks.push(block);
    }
  }

  private timeToDisplay(meeting) {
    const start = moment(meeting.startTime).format('h:mm');
    const end = moment(meeting.endTime).format('h:mma');
    return `${start}-${end}`;
  }

  private selectableMeeting(meeting) {
    const isFuture = moment(meeting.startTime).isAfter(moment(), 'minutes');
    return meeting.type.id !== 4 && isFuture;
  }

  private getMeetings(date: DateNavigatorOutput) {
    if (!this.selectedUser || !date) {
      return;
    }

    this.days =
      this.timerange === 'day'
        ? [moment(date.startDate).format('ddd D')]
        : Array.from(Array(7), (t, i) =>
            moment(date.startDate)
              .add(i, 'day')
              .format('ddd D')
          );

    const start = moment(date.startDate)
      .startOf('day')
      .toISOString();
    const end = moment(date.endDate)
      .endOf('day')
      .toISOString();

    const availableRequest = {
      startTime: start,
      endTime: end,
      providers: [this.selectedUser.id]
    };

    const meetingRequest = {
      startTimeBegin: start,
      startTimeEnd: end,
      accounts: [this.selectedUser.id]
    };

    Observable.fromPromise(this.schedule.fetchCalendarAvailability(availableRequest))
      .zip(this.schedule.fetchAllMeeting(meetingRequest))
      .subscribe(([availableResponse, meetingResponse]) => {
        const meetings = new Array<Meeting>();
        meetingResponse.data.forEach(m => {
          if (moment(m.startTime).day() === moment(m.endTime).day()) {
            const meeting = {
              ...m,
              timeToDisplay: this.timeToDisplay(m),
              selectable: this.selectableMeeting(m)
            };
            meetings.push(meeting);
          } else {
            const startMeeting = {
              ...m,
              timeToDisplay: this.timeToDisplay(m),
              selectable: this.selectableMeeting(m)
            };
            const endMeeting = {
              ...m,
              timeToDisplay: this.timeToDisplay(m),
              selectable: this.selectableMeeting(m)
            };
            startMeeting.endTime = moment(startMeeting.startTime)
              .hours(24)
              .minutes(0)
              .toISOString();
            endMeeting.startTime = moment(startMeeting.endTime)
              .startOf('day')
              .toISOString();
            meetings.push(startMeeting);
            meetings.push(endMeeting);
          }
        });
        this.generateTimes(meetings, availableResponse.entries);
      });
  }

  public selectedDate(dates: DateNavigatorOutput): void {
    this.dates = dates;
    this.getMeetings(this.dates);
    // prevents exception when changing timeframe from child component
    this.cdr.detectChanges();
  }
}
