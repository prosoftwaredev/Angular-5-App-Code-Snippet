import {
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs/Subscription';
import { Account, Goal, OrganizationAssociation, Timezone } from 'selvera-api';
import { LayoutService, NotifierService } from '../../../../service';
import { _, BindForm, BINDFORM_TOKEN } from '../../../../shared';
import {
  FetchClientAssociationResponse,
  FetchGoalResponse,
  FetchSingleAccountResponse,
  TimezoneResponse
} from '../../../../shared/selvera-api';

@Component({
  selector: 'app-dieter-form',
  templateUrl: './dieter.component.html',
  styleUrls: ['./dieter.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: BINDFORM_TOKEN,
      useExisting: forwardRef(() => DieterFormComponent)
    }
  ]
})
export class DieterFormComponent implements BindForm, OnInit, OnDestroy {
  @Input() dieterId: number;

  form: FormGroup;
  isLoading = false;
  lang: string;
  colSpan = 2;
  colSpanSub: Subscription;
  rowSpan = false;
  rowSpanSub: Subscription;

  clinics = [];
  genders = [
    { value: 'male', viewValue: _('SELECTOR.GENDER.MALE') },
    { value: 'female', viewValue: _('SELECTOR.GENDER.FEMALE') }
    // { value: 'notspecified', viewValue: _('SELECTOR.GENDER.NOTSPECIFIED') }
  ];
  feets = [3, 4, 5, 6, 7];
  inches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  timezones: Array<TimezoneResponse> = this.timezone.fetch();

  constructor(
    private builder: FormBuilder,
    private translator: TranslateService,
    private account: Account,
    private goal: Goal,
    private association: OrganizationAssociation,
    private timezone: Timezone,
    private layout: LayoutService,
    private notifier: NotifierService
  ) {}

  ngOnInit() {
    // setup the FormGroup
    this.createForm();
    // set the current language to display the proper timezones
    this.lang = this.translator.currentLang;
    // setup mat-grid responsiveness
    this.colSpanSub = this.layout.colSpan.subscribe(val => (this.colSpan = val));
    this.rowSpanSub = this.layout.rowSpan.subscribe(val => (this.rowSpan = val));
    // setup clinics selector
    this.association
      .fetchCoachAssociation()
      .then(clinics => {
        this.clinics = clinics.map(c => ({
          value: c.organization,
          viewValue: c.organizationName
        }));
      })
      .catch(err => this.notifier.error(err));

    if (this.dieterId) {
      this.isLoading = true;
      this.loadDieterData();
    }
  }

  ngOnDestroy() {
    this.colSpanSub.unsubscribe();
    this.rowSpanSub.unsubscribe();
  }

  createForm() {
    this.form = this.builder.group({
      userId: this.dieterId,
      firstName: '',
      lastName: '',
      email: '',
      password: Math.random()
        .toString(13)
        .substr(2), // TODO the API shoult do this
      isActive: true,
      clientPhone: '',
      clientBirthday: null,
      clientGender: '',
      clientFeet: '',
      clientInches: '',
      startDate: new Date(),
      timezone: 'America/New_York',
      weightInitial: '',
      weightGoal: '',
      measurementPreference: 'us',
      clinic: ''
    });
  }

  private loadDieterData(): void {
    Promise.all([
      this.account.fetchSingle(this.dieterId),
      this.association.fetchClientAssociation(this.dieterId),
      this.goal.fetch({ account: `${this.dieterId}` })
    ])
      .then(res => {
        const account: FetchSingleAccountResponse = res[0];
        const clinics: FetchClientAssociationResponse[] = res[1];
        const goals: FetchGoalResponse = res[2];

        // override initial values
        this.form.patchValue({
          password: undefined,
          startDate: null
        });

        // TODO pending start date and initial weight
        this.form.patchValue(DieterFormComponent.postRead(account, clinics, goals));

        this.isLoading = false;
      })
      .catch(err => this.notifier.error(err));
  }

  static initialClinic: number;

  static postRead(
    account: FetchSingleAccountResponse,
    clinics: FetchClientAssociationResponse[],
    goals: FetchGoalResponse
  ) {
    // process the account data
    Object.keys(account.client).forEach(field => {
      switch (field) {
        case 'height':
          // height unit conversion from cm
          let height = account.client.height * 0.3937008 / 12;
          account['clientFeet'] = Math.floor(height);
          height -= account['clientFeet'];
          account['clientInches'] = Math.round(height * 12);
          break;

        case 'birthday':
          account['clientBirthday'] = moment(account.client.birthday)
            .utc()
            .toDate();
          break;

        default:
          const key = 'client' + field.replace(/\b\w/g, f => f.toUpperCase());
          account[key] = account.client[field];
      }
    });

    // process the clinic
    account['clinic'] = clinics[0].organization;
    DieterFormComponent.initialClinic = +clinics[0].organization;

    // process the incoming goals
    account['weightGoal'] =
      goals.goal.weight === null ? 0 : Math.round(goals.goal.weight * 0.00220462); // g to lb

    return account;
  }

  static preSave(data) {
    // process the account data
    if (data.clientBirthday) {
      data.clientBirthday = data.clientBirthday.toISOString().slice(0, 10);
    }
    if (data.startDate) {
      data.startDate = data.startDate.toISOString().slice(0, 10);
    }
    if (data.clientFeet) {
      // height unit conversion to cm
      data.clientHeight = Math.round((+data.clientFeet * 12 + +data.clientInches) * 2.54);
      delete data.clientFeet;
      delete data.clientInches;
    }

    // collect the clinics data
    let clinics: Array<number> = [];
    if (data.hasOwnProperty('clinic')) {
      // patient association
      clinics = [+data.clinic];
      delete data.clinic;
    }

    // collect the goals
    const goals = [];
    if (data.hasOwnProperty('weightGoal')) {
      goals.push({
        goal: 'weight',
        quantity: Math.round(data.weightGoal * 453.592) // lb to g
      });
      delete data.weightGoal;
    }

    return { data, clinics, goals };
  }
}
