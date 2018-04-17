import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { IPSummaryData } from 'selvera-api';
import { ContextService, EventsService, NotifierService } from '../../../../../service';
import {
  MeasurementDatabase,
  MeasurementDataSource,
  UserDashboardDatabase
} from '../../services';
import { DieterDataService } from '../../services/data.service';
import { _ } from './../../../../../shared';
import {
  FetchBodyMeasurementRequest,
  FetchBodyMeasurementResponse
} from './../../../../../shared/selvera-api';

@Component({
  selector: 'app-dieter-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DieterDashboardComponent implements OnInit {
  isLoading = true;

  source: MeasurementDataSource | null;
  selectedActivityLevel;

  @ViewChild(MatSelect) activitySelector: MatSelect;

  constructor(
    private translator: TranslateService,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private database: MeasurementDatabase,
    public data: UserDashboardDatabase
  ) {}

  activityLevels = [
    { value: 0, viewValue: _('SELECTOR.LEVEL.NONE') },
    { value: 2, viewValue: _('SELECTOR.LEVEL.LOW') },
    { value: 4, viewValue: _('SELECTOR.LEVEL.MEDIUM') },
    { value: 7, viewValue: _('SELECTOR.LEVEL.HIGH') },
    { value: 10, viewValue: _('SELECTOR.LEVEL.INTENSE') }
  ];

  ngOnInit() {
    // default level is medium
    this.selectedActivityLevel = this.activityLevels[2].value;
    this.data.init(this.selectedActivityLevel);

    this.source = new MeasurementDataSource(
      this.notifier,
      this.database,
      this.translator
    );
    this.source.addDefault({
      account: this.context.dieterId
    });

    this.bus.trigger('right-panel.component.set', 'reminders');
  }

  setupActivityLevel(): void {
    this.activitySelector.open();
  }

  selectActivityLevel(activityLevel): void {
    this.data.update(activityLevel);
  }
}
