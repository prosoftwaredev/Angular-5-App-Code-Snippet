import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Timezone } from 'selvera-api';
import { LayoutService } from '../../../service';
import { FormUtils } from '../../../shared';
import { MEASUREMENT_UNITS } from '../../../shared/selvera-api/units';
import { Profile, TimezoneResponse, UpdateRequest } from './../../../shared/selvera-api';

@Component({
  selector: 'account-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  _data = new BehaviorSubject<Profile[]>([]);
  form: FormGroup;
  lang: String;
  colSpan = 2;
  colSpanSub: Subscription;
  rowSpan = false;
  rowSpanSub: Subscription;

  @Input()
  set profile(value) {
    this._data.next(value);
  }

  get profile() {
    return this._data.getValue();
  }

  @Output()
  onProfileSaved: EventEmitter<UpdateRequest> = new EventEmitter<UpdateRequest>();

  timezones: Array<TimezoneResponse> = this.timezone.fetch();
  units = MEASUREMENT_UNITS;

  constructor(
    private builder: FormBuilder,
    private translator: TranslateService,
    private timezone: Timezone,
    private layout: LayoutService,
    private formUtils: FormUtils
  ) {}

  ngOnInit() {
    // setup the FormGroup
    this.createForm();

    this._data.subscribe(x => {
      if (this.profile) {
        this.populateFields();
      }
    });

    // setup mat-grid responsiveness
    this.colSpanSub = this.layout.colSpan.subscribe(val => (this.colSpan = val));
    this.rowSpanSub = this.layout.rowSpan.subscribe(val => (this.rowSpan = val));

    // get the current lang
    this.lang = this.translator.currentLang;
  }

  ngOnDestroy() {
    this.colSpanSub.unsubscribe();
    this.rowSpanSub.unsubscribe();
  }

  createForm() {
    this.form = this.builder.group({
      firstName: '',
      lastName: '',
      email: '',
      timezone: 'America/New_York',
      measurementPreference: ''
    });
  }

  populateFields(): void {
    this.form.patchValue(this.profile);
  }

  onSubmit() {
    if (this.form.valid) {
      const data: UpdateRequest = this.form.value;
      this.onProfileSaved.next(data);
    } else {
      this.formUtils.markAsTouched(this.form);
    }
  }
}
