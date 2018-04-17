import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as lodash from 'lodash';
import * as moment from 'moment-timezone';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ContextService, EventsService, NotifierService } from '../../../../../service';
import { DateNavigatorOutput } from '../../../../../shared';
import {
  MeasurementDatabase,
  MeasurementDataSource,
  MeasurementSummaryData,
  MeasurementTimeframe
} from '../../services';
import { MeasurementChartOutput } from './index';

export type MeasurementSections = 'composition' | 'circumference' | 'energy' | 'food';
export type MeasurementConfig = {
  [S in MeasurementSections]: {
    data: MeasurementSummaryData[];
    columns: string[];
  }
};

@Component({
  selector: 'app-dieter-measurements',
  templateUrl: 'measurements.component.html',
  styleUrls: ['measurements.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DieterMeasurementsComponent implements OnInit, OnDestroy {
  // controls with their config
  components = ['composition', 'circumference', 'energy', 'food'];
  component: MeasurementSections = 'composition';
  sections: MeasurementConfig = {
    composition: {
      data: ['weight', 'bmi', 'visceralFatPercentage', 'bodyFat', 'waterPercentage'],
      columns: ['date', 'weight', 'bmi', 'bodyFat', 'leanMass', 'waterPercentage']
    },
    circumference: {
      data: ['waist', 'arm', 'chest', 'hip', 'thigh'],
      columns: ['date', 'waist', 'arm', 'chest', 'hip', 'thigh']
    },
    energy: {
      data: ['steps', 'total', 'sleepQuality', 'distance'],
      columns: ['date', 'steps', 'distance', 'total', 'sleepQuality']
    },
    food: {
      data: ['calories', 'protein', 'carbohydrates', 'totalFat'],
      columns: ['date', 'calories', 'protein', 'carbohydrates', 'totalFat']
    }
  };
  timeframe = 'week';
  view = 'table';
  dates: DateNavigatorOutput = {};
  data: MeasurementSummaryData[];
  measurement: MeasurementSummaryData;
  columns: string[];
  routerParamSub: Subscription;

  // datasource refresh trigger
  refresh$ = new Subject<any>();

  source: MeasurementDataSource | null;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private translator: TranslateService,
    private context: ContextService,
    private bus: EventsService,
    private notifier: NotifierService,
    private database: MeasurementDatabase
  ) {}

  ngOnInit() {
    this.bus.trigger('right-panel.component.set', 'addMeasurements');

    this.source = new MeasurementDataSource(
      this.notifier,
      this.database,
      this.translator
    );
    this.source.addDefault({
      account: this.context.dieterId
    });

    this.source.addOptional(this.refresh$, () => {
      // adjust the unit according to the selected timeframe
      let unit;
      switch (this.dates.timeframe) {
        case 'alltime':
        case 'week':
          unit = 'day';
          break;
        case 'month':
          unit = 'week';
          break;
        default:
          unit = 'month';
      }
      return {
        data: this.view === 'table' ? this.data : [this.measurement],
        timeframe: this.dates.timeframe as MeasurementTimeframe,
        startDate: moment(this.dates.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.dates.endDate).format('YYYY-MM-DD'),
        unit: unit
      };
    });

    // component initialization
    this.routerParamSub = this.route.paramMap.subscribe((params: ParamMap) => {
      // TODO add timeframe, date
      const s = params.get('s') as MeasurementSections;
      this.section = this.components.indexOf(s) >= 0 ? s : this.component;

      const v = params.get('v');
      this.view = ['table', 'chart'].indexOf(v) >= 0 ? v : this.view;
    });

    this.cdr.detectChanges();
    this.bus.register('dieter.measurement.refresh', this.refreshData.bind(this));
  }

  ngOnDestroy() {
    this.routerParamSub.unsubscribe();
    this.bus.unregister('dieter.measurement.refresh');
  }

  get section(): MeasurementSections {
    return this.component;
  }
  set section(target: MeasurementSections) {
    this.component = target;
    this.data = this.sections[target].data;
    this.columns = this.sections[target].columns;
    if (!this.measurement || !lodash.filter(this.data, this.measurement).length) {
      this.measurement = this.data[0];
    }
    this.refresh$.next('measurements.section');
    this.bus.trigger('add-measurement.section.change', target);
  }

  toggleView() {
    if (this.view === 'chart') {
      this.timeframe = 'week';
    }
    const params = {
      s: this.component,
      v: this.view === 'table' ? 'chart' : 'table'
    };
    this.router.navigate(['.', params], {
      relativeTo: this.route
    });
  }

  updateDates(dates: DateNavigatorOutput) {
    this.dates = dates;
    this.refresh$.next('measurements.updateDates');
    // prevents exception when changing timeframe from child component
    this.cdr.detectChanges();
  }

  chartChanged(data: MeasurementChartOutput) {
    this.measurement = data.measurement;
    if (this.timeframe !== data.timeframe) {
      this.timeframe = data.timeframe;
      // and the date-navigator will trigger the update
    } else {
      this.refresh$.next('measurements.chartChanged');
    }
  }

  refreshData(): void {
    this.source.refresh();
  }
}
