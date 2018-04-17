import {
  Component,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs/Subscription';
import { Account, Timezone } from 'selvera-api';
import { ContextService, LayoutService, NotifierService } from '../../../../service';
import { BindForm, BINDFORM_TOKEN } from '../../../../shared';
import {
  FetchSingleAccountResponse,
  TimezoneResponse
} from '../../../../shared/selvera-api';
import { ClinicsDatabase, ClinicsDataSource, ClinicsPickerValue } from '../../clinics';

@Component({
  selector: 'app-coach-form',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.scss'],
  providers: [
    {
      provide: BINDFORM_TOKEN,
      useExisting: forwardRef(() => CoachFormComponent)
    }
  ]
})
export class CoachFormComponent implements BindForm, OnInit, OnDestroy {
  @Input() coachId: number;

  @HostBinding('class.ccr-styled')
  @Input()
  styled = false;

  form: FormGroup;
  isLoading = false;
  isOwnProfile = true;
  lang: string;
  colSpan = 2;
  colSpanSub: Subscription;

  timezones: Array<TimezoneResponse> = this.timezone.fetch();
  source: ClinicsDataSource | null;

  constructor(
    private builder: FormBuilder,
    private translator: TranslateService,
    private account: Account,
    private timezone: Timezone,
    private context: ContextService,
    private layout: LayoutService,
    private notifier: NotifierService,
    private database: ClinicsDatabase
  ) {}

  ngOnInit() {
    this.isOwnProfile = this.coachId === +this.context.user.id;

    // setup the FormGroup
    this.createForm();
    // set the current language to display the proper timezones
    this.lang = this.translator.currentLang;
    // setup mat-grid responsiveness
    this.colSpanSub = this.layout.colSpan.subscribe(val => (this.colSpan = val));
    // setup the clinics table source
    this.source = new ClinicsDataSource(this.notifier, this.database);

    if (this.coachId) {
      this.isLoading = true;
      this.loadCoachData();
    }
  }

  ngOnDestroy() {
    this.colSpanSub.unsubscribe();
  }

  createForm() {
    this.form = this.builder.group({
      userId: this.coachId,
      firstName: '',
      lastName: '',
      email: '',
      password: Math.random()
        .toString(13)
        .substr(2), // TODO the API should do this
      isActive: true,
      // clientPhone: '',
      timezone: 'America/New_York',
      measurementPreference: 'us',
      clinics: []
    });
  }

  private loadCoachData(): void {
    this.account
      .fetchSingle(this.coachId)
      .then((account: FetchSingleAccountResponse) => {
        // override initial values
        this.form.patchValue({
          password: undefined
        });

        this.form.patchValue(CoachFormComponent.postRead(account));

        this.isLoading = false;
      })
      .catch(err => this.notifier.error(err));
  }

  static postRead(account: FetchSingleAccountResponse) {
    // process the account data
    Object.keys(account.client).forEach(field => {
      switch (field) {
        case 'birthday':
          account['clientBirthday'] = account.client.birthday
            ? moment(account.client.birthday)
                .utc()
                .toDate()
            : null;
          break;

        default:
          const key = 'client' + field.replace(/\b\w/g, f => f.toUpperCase());
          account[key] = account.client[field];
      }
    });

    return account;
  }

  static preSave(data): { data: any; clinics: Array<ClinicsPickerValue> } {
    // process the account data
    if (data.clientBirthday) {
      data.clientBirthday = data.clientBirthday.toISOString().slice(0, 10);
    }
    if (data.startDate) {
      data.startDate = data.startDate.toISOString().slice(0, 10);
    }

    // collect the clinics data
    const clinics = data.clinics;
    delete data.clinics;

    return { data, clinics };
  }
}
