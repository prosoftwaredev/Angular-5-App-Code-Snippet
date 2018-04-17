import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { ContextService, EventsService, NotifierService } from '../../../../../service';
import { _, FormUtils, TranslationsObject } from '../../../../../shared';
import { AddMeetingRequest, MeetingAttendee } from '../../../../../shared/selvera-api';
import { ScheduleDataService } from '../../../services';

@Component({
  selector: 'app-set-unavailability',
  templateUrl: './set-unavailability.component.html',
  styleUrls: ['./set-unavailability.component.scss']
})
export class SetAvailabilityComponent implements OnInit {
  form: FormGroup;
  formSubmitted: boolean = false;
  translations: TranslationsObject;
  attendee: MeetingAttendee;
  durations = [];
  max: moment.Moment;
  get now() {
    return moment();
  }

  constructor(
    private builder: FormBuilder,
    private translator: TranslateService,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private dataService: ScheduleDataService,
    public formUtils: FormUtils
  ) {}

  ngOnInit() {
    this.initForm();
    this.setMax();

    this.translator
      .get([
        _('UNIT.HOUR'),
        _('UNIT.HOURS'),
        _('UNIT.MINS'),
        _('GLOBAL.UNAVAILABLE_TIME')
      ])
      .subscribe((translations: TranslationsObject) => {
        this.translations = translations;
        this.setDurations();
      });

    this.context.selected$.subscribe(user => {
      if (user) {
        this.attendee = {
          account: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        };
      }
    });
  }

  initForm(): void {
    const initial = this.formUtils.getInitialDate();

    this.form = this.builder.group(
      {
        date: [initial, Validators.required],
        allDay: false,
        start: [initial],
        duration: [null]
      },
      {
        validator: this.validateForm
      }
    );
  }

  setMax() {
    this.max = moment(this.form.get('date').value)
      .startOf('day')
      .add(1, 'day')
      .subtract(15, 'minutes'); // at least one duration slot
  }

  compareFn(t1: any, t2: any): boolean {
    return t1 && t2 ? t1.hour === t2.hour && t1.minute === t2.minute : false;
  }

  setDurations(): void {
    const time = this.form.get('start').value ? this.form.get('start').value : moment();

    this.durations.length = 0;
    const duration = moment.duration(0);
    const limit = moment(time)
      .add(1, 'day')
      .startOf('day');

    let check;
    for (let i = 0; i < 96; i++) {
      duration.add(15, 'minutes');
      check = moment(time).add(duration);

      if (check.isAfter(limit, 'minutes')) {
        break;
      }

      this.durations.push({
        value: { hour: duration.hours(), minute: duration.minutes() },
        viewValueH:
          duration.hours() === 0
            ? this.durations.length > 3 ? `24 ${this.translations['UNIT.HOURS']}` : ''
            : duration.hours() === 1
              ? `1 ${this.translations['UNIT.HOUR']}`
              : `${duration.hours()} ${this.translations['UNIT.HOURS']}`,
        viewValueM:
          duration.minutes() === 0
            ? ''
            : `${duration.minutes()} ${this.translations['UNIT.MINS']}`
      });
    }
  }

  validateForm(control: AbstractControl) {
    const meetingDate = moment(control.get('date').value);
    const allDay = control.get('allDay').value;
    const start = control.get('start').value;
    const duration = control.get('duration').value;

    if (control.get('date').errors || !meetingDate.isValid()) {
      return { validateMeetingTime: _('NOTIFY.ERROR.ENTER_VALID_DATE') };
    }

    if (!allDay && (!start || !duration)) {
      return { validateMeetingTime: _('NOTIFY.ERROR.TIMES_EMPTY') };
    }

    if (!allDay && start) {
      if (start.isBefore(moment(), 'minutes')) {
        return { validateMeetingTime: _('NOTIFY.ERROR.TIME_SHOULD_BE_FUTURE') };
      } else {
        return null;
      }
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.form.valid) {
      const data = this.form.value;
      data.date.seconds(0);

      const start = data.allDay ? data.date.startOf('day').format() : data.start.format();

      const end = data.allDay
        ? data.date.endOf('day').format()
        : data.start.add(moment.duration(data.duration)).format();

      const addMeetingRequest: AddMeetingRequest = {
        title: this.translations['GLOBAL.UNAVAILABLE_TIME'],
        startTime: start,
        endTime: end,
        meetingTypeId: '4',
        attendees: [this.attendee]
      };

      this.dataService
        .saveMeeting(addMeetingRequest)
        .then(res => {
          this.notifier.success(_('NOTIFY.SUCCESS.UNAVAILABILITY_ADDED'));
          this.bus.trigger('schedule.table.refresh');
          this.formSubmitted = false;
          this.form.reset();
          this.setDurations();
        })
        .catch(err => this.notifier.error(err));
    } else {
      this.formUtils.markAsTouched(this.form);
    }
  }
}
