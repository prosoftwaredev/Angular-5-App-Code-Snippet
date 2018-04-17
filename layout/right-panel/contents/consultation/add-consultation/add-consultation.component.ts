import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatAutocompleteTrigger, MatDialog } from '@angular/material';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs/Subscription';
import { Account, OrganizationAssociation, Schedule } from 'selvera-api';
import { ContextService, EventsService, NotifierService } from '../../../../../service';
import { _, FormUtils, PromptDialog, TranslateMessage } from '../../../../../shared';
import {
  AddAttendeeRequest,
  AddMeetingRequest,
  FetchMeetingResponse,
  FetchMeetingTypesResponse,
  MeetingAttendee,
  Profile,
  SearchResultAccount
} from '../../../../../shared/selvera-api';
import { ScheduleDataService } from '../../../services';

export type AddConsultationAttendee = MeetingAttendee & {
  accountType?: string;
};

@Component({
  selector: 'app-add-consultation',
  templateUrl: './add-consultation.component.html',
  styleUrls: ['./add-consultation.component.scss']
})
export class AddConsultationComponent implements OnInit {
  form: FormGroup;
  formSubmitted: boolean = false;
  editing = 0;
  clinicChangeSubscription: Subscription;
  meetingTypeChangeSubscription: Subscription;
  meetingTypesOk = true;
  get now() {
    return moment();
  }

  clinics = [];
  durations = [];
  repeatOptions = [
    { value: 'never', viewValue: _('RIGHT_PANEL.NEVER') },
    { value: '1w', viewValue: _('RIGHT_PANEL.EVERY_WEEK') },
    { value: '2w', viewValue: _('RIGHT_PANEL.EVERY_OTHER_WEEK') },
    { value: '4w', viewValue: _('RIGHT_PANEL.EVERY_4_WEEKS') }
  ];
  endRepeatOptions = [
    { value: 'never', viewValue: _('RIGHT_PANEL.NEVER') },
    { value: 'after', viewValue: _('RIGHT_PANEL.AFTER') }
  ];
  meetingTypes: FetchMeetingTypesResponse[];
  searchCtrl: FormControl;
  user: Profile;
  accounts: Array<SearchResultAccount>;
  attendees: Array<AddConsultationAttendee> = [];
  addedAttendees: Array<AddConsultationAttendee> = [];
  removedAttendees: Array<string> = [];

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;

  constructor(
    private builder: FormBuilder,
    private dialog: MatDialog,
    private account: Account,
    private association: OrganizationAssociation,
    private schedule: Schedule,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private dataService: ScheduleDataService,
    public formUtils: FormUtils
  ) {}

  ngOnInit() {
    this.initForm();
    this.getClinics();
    this.setupAutocomplete();

    this.user = this.context.user;
    this.context.selected$.subscribe(user => {
      if (user) {
        this.resetParticipants();
      }
    });

    this.bus.register('right-panel.consultation.meeting', (id: number) => {
      const exec = () => {
        this.editing = id ? id : 0;
        id ? this.editForm(id) : this.initForm();
        this.bus.trigger('right-panel.consultation.editing', id ? true : false);
      };
      this.form.dirty ? this.confirmDiscard(exec) : exec();
    });
  }

  ngOnDestroy() {
    this.bus.unregister('right-panel.consultation.meeting');
    this.unlistenChanges();
  }

  initForm(): void {
    const initial = this.formUtils.getInitialDate();

    this.form = this.builder.group(
      {
        title: [null, Validators.required],
        date: initial,
        startTime: [initial, Validators.required],
        duration: [null, Validators.required],
        clinic: [null, Validators.required],
        meetingTypeId: [null, Validators.required],
        repeat: ['never', Validators.required],
        endRepeat: 'never',
        endAfter: null,
        location: this.builder.group(
          {
            streetAddress: null,
            city: null,
            state: null,
            postalCode: null,
            country: null
          },
          {
            validator: this.validateLocation
          }
        )
      },
      {
        validator: this.validateForm
      }
    );

    this.listenChanges();
  }

  listenChanges() {
    this.clinicChangeSubscription = this.form
      .get('clinic')
      .valueChanges.subscribe(c => this.clinicChanged(c));

    this.meetingTypeChangeSubscription = this.form
      .get('meetingTypeId')
      .valueChanges.subscribe((type: FetchMeetingTypesResponse) =>
        this.meetingTypeChanged(type)
      );
  }

  unlistenChanges() {
    if (this.clinicChangeSubscription) {
      this.clinicChangeSubscription.unsubscribe();
      this.clinicChangeSubscription = null;
    }
    if (this.meetingTypeChangeSubscription) {
      this.meetingTypeChangeSubscription.unsubscribe();
      this.meetingTypeChangeSubscription = null;
    }
  }

  editForm(id) {
    // unsubscribe from events while setting the value
    this.unlistenChanges();

    // fetch the meeting and patch the form
    this.dataService
      .fetchMeeting(id)
      .then((meeting: FetchMeetingResponse) => {
        const clinic = this.clinics.find(
          c => c.value.organizationShortcode === meeting.organizationShortcode
        );
        const startTime = moment(meeting.startTime);
        const endTime = moment(meeting.endTime);
        const momentDuration = moment.duration(endTime.diff(startTime));
        let duration;
        this.dataService
          .fetchMeetingTypes(clinic.value.organization)
          .then(meetingTypes => {
            // TODO include Google Calendar only for edition
            // (and hide date/duration? do not process them?)
            // TODO ML support i18n mapping the description
            this.meetingTypes = meetingTypes.filter(t => [4].indexOf(t.typeId) === -1);
            let meetingType;
            if (meetingTypes.length) {
              meetingType = this.meetingTypes.find(t => +t.typeId === +meeting.type.id);
              if (meetingType) {
                this.durations.length = 0;
                if (meetingType.durations.length) {
                  meetingType.durations.forEach(d => {
                    this.durations.push({
                      value: d,
                      viewValue: moment.duration(d).humanize()
                    });
                  });
                  duration = this.durations.find(
                    d => moment.duration(d.value).humanize() === momentDuration.humanize()
                  );
                }
              }
            }
            clinic.value.streetAddress = clinic.value.address;

            this.form.patchValue({
              title: meeting.title,
              date: moment(meeting.startTime),
              startTime: moment(meeting.startTime),
              clinic: clinic.value,
              meetingTypeId: meetingType,
              duration: duration ? duration.value : null,
              location: clinic.value
            });

            this.attendees = meeting.attendees;

            // subscribe to changes again
            this.listenChanges();
          })
          .catch(() => this.notifier.error(_('NOTIFY.ERROR.RETRIEVING_MEETING_TYPES')));
      })
      .catch(err => this.notifier.error(err));
  }

  resetForm(): void {
    this.editing = 0;
    // reset form manually
    const initial = this.formUtils.getInitialDate();
    this.form.patchValue({
      title: '',
      date: initial,
      startTime: initial,
      duration: null,
      repeat: 'never',
      endRepeat: 'never',
      endAfter: null
    });
    this.resetParticipants();
    this.formSubmitted = false;
    // deactivate edition mode
    this.bus.trigger('schedule.table.selected', 0);
    this.bus.trigger('right-panel.consultation.editing', false);
    // mark the form as pristine
    this.form.markAsPristine({ onlySelf: false });
  }

  validateForm(control: AbstractControl) {
    const startTime = control.get('startTime').value;
    if (startTime) {
      if (startTime.isBefore(moment(), 'minutes')) {
        return { validateMeetingTime: _('NOTIFY.ERROR.DATE_SHOULD_BE_FUTURE') };
      } else {
        return null;
      }
    }
  }

  validateLocation(control: AbstractControl) {
    const street = control.get('streetAddress').value;
    const city = control.get('city').value;
    const state = control.get('state').value;
    const postalCode = control.get('postalCode').value;
    if (street || city || state || postalCode) {
      if (street && city && state && postalCode) {
        return null;
      } else {
        return { validateAddress: _('NOTIFY.ERROR.INCOMPLETE_ADDRESS') };
      }
    }
  }

  getClinics(): void {
    this.association
      .fetchCoachAssociation()
      .then(clinics => {
        this.clinics = clinics.map(c => ({
          value: c,
          viewValue: c.organizationName
        }));
        if (this.clinics.length) {
          this.form.get('clinic').setValue(this.clinics[0].value);
        }
      })
      .catch(err => this.notifier.error(err));
  }

  clinicChanged(org): void {
    org.streetAddress = org.address;
    this.form.get('location').patchValue(org);
    this.dataService
      .fetchMeetingTypes(org.organization)
      .then(res => {
        this.meetingTypesOk = res.length > 0;
        // TODO ML support i18n mapping the description
        this.meetingTypes = res.filter(t => [4, 5].indexOf(t.typeId) === -1);
        if (res.length) {
          this.form.get('meetingTypeId').setValue(res[0]);
        }
      })
      .catch(() => this.notifier.error(_('NOTIFY.ERROR.RETRIEVING_MEETING_TYPES')));
  }

  meetingTypeChanged(type): void {
    this.durations.length = 0;
    if (type.durations.length) {
      type.durations.forEach(d => {
        this.durations.push({
          value: d,
          viewValue: moment.duration(d).humanize()
        });
      });
      this.form.get('duration').setValue(type.durations[0]);
    }
  }

  setupAutocomplete(): void {
    this.searchCtrl = new FormControl();
    this.searchCtrl.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(query => {
        if (query) {
          this.searchAccounts(query);
        } else {
          this.trigger.closePanel();
        }
      });
  }

  searchAccounts(query: string): void {
    this.account
      .search(query)
      .then((res: Array<SearchResultAccount>) => {
        this.accounts = res.filter(a => !this.attendees.some(sa => sa.account === a.id));
        if (this.accounts.length > 0) {
          this.trigger.openPanel();
        }
      })
      .catch(err => this.notifier.error(err));
  }

  formatAccountType(accountType) {
    let result;
    if ([2, '2', 'provider'].indexOf(accountType) >= 0) {
      result = _('GLOBAL.COACH');
    } else if ([3, '3', 'client'].indexOf(accountType) >= 0) {
      result = _('GLOBAL.PATIENT');
    }
    return result ? result : '';
  }

  addParticipant(account): void {
    const participantIds = this.attendees.map(a => a.account);
    if (participantIds.indexOf(account.id) === -1) {
      const attendee: AddConsultationAttendee = {
        account: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        accountType: account.accountType
      };
      this.attendees.push(attendee);

      if (this.editing) {
        if (!this.removedAttendees.some(id => id === attendee.account)) {
          this.addedAttendees.push(attendee);
        } else {
          this.removedAttendees = this.removedAttendees.filter(
            id => id !== attendee.account
          );
        }
      }
    }
    this.accounts = [];
  }

  removeParticipant(id: string): void {
    this.attendees = this.attendees.filter(a => a.account !== id);

    if (this.editing) {
      if (!this.addedAttendees.some(a => a.account === id)) {
        this.removedAttendees.push(id);
      } else {
        this.addedAttendees = this.addedAttendees.filter(a => id !== a.account);
      }
    }
  }

  resetParticipants(): void {
    this.attendees.length = 0;
    this.addParticipant(this.context.selected);
  }

  repeatChanged(option): void {
    if (option === 'never') {
      this.form.get('endRepeat').reset('never');
      this.form.get('endAfter').reset(null);
    }
  }

  endRepeatChanged(option): void {
    if (option === 'never') {
      this.form.get('endAfter').reset(null);
    }
  }

  confirmDiscard(callback) {
    if (this.form.dirty) {
      // prompt to discard changes
      this.dialog
        .open(PromptDialog, {
          data: {
            title: _('RIGHT_PANEL.DISCARD_CHANGES'),
            content: _('RIGHT_PANEL.CONFIRM_DISCARD_MEETING_CHANGES')
          }
        })
        .afterClosed()
        .subscribe(confirm => {
          if (confirm) {
            callback();
          }
        });
    } else {
      callback();
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.form.valid) {
      const data = this.form.value;

      const addMeetingRequest: AddMeetingRequest = {
        title: data.title,
        startTime: data.startTime.format(),
        endTime: moment(data.startTime)
          .add(moment.duration(data.duration))
          .format(),
        meetingTypeId: data.meetingTypeId.typeId,
        organizationShortcode: data.clinic.organizationShortcode,
        organizationName: data.clinic.organizationName,
        attendees: this.attendees.map(a => {
          delete a.accountType;
          return a;
        })
      };
      if (data.location.streetAddress) {
        addMeetingRequest.location = data.location;
      }
      if (data.repeat && data.repeat !== 'never') {
        if (data.endRepeat === 'never') {
          addMeetingRequest.recurring = {
            interval: data.repeat,
            endDate: moment(data.startTime)
              .add(3, 'years')
              .format()
          };
        } else {
          let endDate = moment(data.startTime);
          let days;
          switch (data.repeat) {
            case '1w':
              days = data.endAfter * 7;
              endDate = endDate.add(days, 'days');
              break;
            case '2w':
              days = data.endAfter * 14;
              endDate = endDate.add(days, 'days');
              break;
            case '4w':
              days = data.endAfter * 28;
              endDate = endDate.add(days, 'days');
              break;
          }
          addMeetingRequest.recurring = {
            interval: data.repeat,
            endDate: endDate.format()
          };
        }
      }

      this.dataService
        .saveMeeting(addMeetingRequest, this.editing)
        .then(res => {
          if (this.editing) {
            if (this.addedAttendees.length > 0) {
              const addAttendeeRequest: AddAttendeeRequest = {
                meetingId: this.editing.toString(),
                attendees: this.addedAttendees
              };
              this.dataService
                .addAttendee(addAttendeeRequest)
                .then(() => {})
                .catch(err => this.notifier.error(err));
            }

            this.removedAttendees.map(id => {
              this.dataService
                .deleteAttendee(this.editing.toString(), id)
                .then(() => {})
                .catch(err => this.notifier.error(err));
            });
          }

          this.notifier.success(
            this.editing
              ? _('NOTIFY.SUCCESS.MEETING_UPDATED')
              : _('NOTIFY.SUCCESS.MEETING_ADDED')
          );
          this.bus.trigger('schedule.table.refresh');
          this.resetForm();
        })
        .catch(err => this.notifier.error(err));
    } else {
      this.formUtils.markAsTouched(this.form);
      this.form.updateValueAndValidity();
    }
  }

  onCancel() {
    this.confirmDiscard(() => {
      // deactivate edit mode
      this.resetForm();
    });
  }

  onDelete() {
    this.dialog
      .open(PromptDialog, {
        data: {
          title: _('RIGHT_PANEL.DELETE_MEETING'),
          content: _('RIGHT_PANEL.CONFIRM_DELETE_MEETING')
        }
      })
      .afterClosed()
      .subscribe(confirm => {
        if (confirm) {
          // TODO call the api removing the meeting with ID = this.editing
          const id = this.editing.toString();
          this.schedule
            .deleteMeeting(id)
            .then(() => {
              this.notifier.success(_('NOTIFY.SUCCESS.MEETING_DELETED'));
              this.bus.trigger('schedule.table.refresh');
              this.resetForm();
            })
            .catch(err => this.notifier.error(err));
        }
      });
  }
}
