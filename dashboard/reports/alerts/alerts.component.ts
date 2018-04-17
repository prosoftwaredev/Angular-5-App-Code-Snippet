import { Component, OnInit } from '@angular/core';
import { findIndex, merge } from 'lodash';
import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';
import { Reports } from 'selvera-api';
import {
  CCRService,
  ClinicSelectorItem,
  EventsService,
  NotifierService
} from '../../../service';
import { _ } from '../../../shared';
import { AlertsDatabase, AlertsDataSource } from './services';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  source: AlertsDataSource | null;

  // clinics for dropdown
  clinics: ClinicSelectorItem[] = [];
  clinic: string;

  // TODO enforce type
  alerts: any[] = [];
  alert: Array<string> | undefined;

  constructor(
    private ccr: CCRService,
    private bus: EventsService,
    private notifier: NotifierService,
    private reports: Reports,
    private database: AlertsDatabase
  ) {}

  // refresh chart trigger
  refresh$ = new Subject<boolean>();

  ngOnInit() {
    this.bus.trigger('right-panel.deactivate');

    // setup the table source
    this.source = new AlertsDataSource(this.notifier, this.database);
    this.source.addRequired(this.refresh$, () => ({
      organization: this.clinic
    }));
    this.source.addOptional(this.refresh$, () => ({
      alertType: this.alert
    }));

    // setup the alertTypes selector
    this.alerts = [
      { viewValue: _('REPORTS.CLEAR_FILTER'), value: undefined },
      { viewValue: 'Measurements', value: ['1'] },
      { viewValue: 'Activity', value: ['2', '3'] }
    ];

    // setup the clinics selector
    this.ccr
      .clinicSelector()
      .then(clinics => {
        this.clinics = clinics;
        this.clinics.unshift({
          viewValue: _('REPORTS.CLEAR_FILTER'),
          value: undefined,
          permissions: { admin: true, accessall: true }
        });
        this.selectClinic(this.clinics[0].value);
      })
      .catch(err => this.notifier.error(err));
  }

  selectClinic(value) {
    this.clinic = value;
    this.refresh$.next(true);
  }

  selectAlertType(value) {
    this.alert = value;
    this.refresh$.next(true);
  }

  refresh() {
    this.refresh$.next(true);
  }
}
