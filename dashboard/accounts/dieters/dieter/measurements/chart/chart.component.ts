import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as lodash from 'lodash';
import * as moment from 'moment-timezone';
import { BaseChartDirective } from 'ng2-charts';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ConfigService } from '../../../../../../service';
import {
  _,
  ChartData,
  ChartDataSource,
  DateNavigatorOutput,
  SelectOptions
} from '../../../../../../shared';
import { MeasurementSummaryData, MeasurementTimeframe } from '../../../services';

export interface MeasurementChartOutput {
  measurement: MeasurementSummaryData;
  timeframe: MeasurementTimeframe;
}

@Component({
  selector: 'app-dieter-measurements-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  host: { class: 'ccr-chart' }
})
export class MeasurementChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  @HostBinding('class.ccr-chart-embedded')
  embedded = false;

  @Input() source: ChartDataSource<any, any> | null;
  @Input() metrics: MeasurementSummaryData[] = [];
  @Input() views: MeasurementTimeframe[] = [];
  @Input() measurement: MeasurementSummaryData;
  @Input() timeframe: MeasurementTimeframe = 'week';

  @Output() change = new EventEmitter<MeasurementChartOutput>();

  @ViewChild(BaseChartDirective) myChart: BaseChartDirective;
  chart: ChartData;
  chartSubscription: Subscription;

  // measurements selector
  measurementTypes: SelectOptions<MeasurementSummaryData> = [
    { value: 'weight', viewValue: _('MEASUREMENT.WEIGHT') },
    { value: 'bmi', viewValue: _('MEASUREMENT.BMI') },
    { value: 'bodyFat', viewValue: _('MEASUREMENT.BODY_FAT') },
    { value: 'leanMass', viewValue: _('MEASUREMENT.LEAN_MASS') },
    { value: 'waterPercentage', viewValue: _('MEASUREMENT.HYDRATION') },
    { value: 'steps', viewValue: _('MEASUREMENT.STEPS') },
    { value: 'average', viewValue: _('MEASUREMENT.STEP_AVERAGE') },
    { value: 'distance', viewValue: _('MEASUREMENT.DISTANCE') },
    { value: 'total', viewValue: _('MEASUREMENT.SLEEP') },
    { value: 'sleepQuality', viewValue: _('MEASUREMENT.RESTFULNESS') },
    { value: 'waist', viewValue: _('MEASUREMENT.WAIST') },
    { value: 'arm', viewValue: _('MEASUREMENT.ARM') },
    { value: 'chest', viewValue: _('MEASUREMENT.CHEST') },
    { value: 'hip', viewValue: _('MEASUREMENT.HIP') },
    { value: 'thigh', viewValue: _('MEASUREMENT.THIGH') },
    { value: 'calories', viewValue: _('MEASUREMENT.CALORIES') },
    { value: 'protein', viewValue: _('BOARD.PROTEIN') },
    { value: 'carbohydrates', viewValue: _('MEASUREMENT.CARBS') },
    { value: 'totalFat', viewValue: _('BOARD.FAT') }
  ];
  measurements: SelectOptions<MeasurementSummaryData> = [];

  // views selector
  viewTypes: SelectOptions<MeasurementTimeframe> = [
    { value: 'day', viewValue: _('SELECTOR.VIEWBY.DAY') },
    { value: 'week', viewValue: _('SELECTOR.VIEWBY.WEEK') },
    { value: 'month', viewValue: _('SELECTOR.VIEWBY.MONTH') },
    { value: 'year', viewValue: _('SELECTOR.VIEWBY.YEAR') },
    { value: 'alltime', viewValue: _('SELECTOR.VIEWBY.ALL_TIME') }
  ];
  viewby: SelectOptions<MeasurementTimeframe> = [];

  // dates navigator store
  dates: DateNavigatorOutput = {};

  // refresh chart trigger
  refresh$ = new Subject<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    private translator: TranslateService,
    private config: ConfigService
  ) {}

  ngOnInit() {
    if (!this.embedded) {
      // takes the control of all the API parameters
      this.source.register('chart', true, this.refresh$, () => {
        // adjust the unit according to the selected timeframe
        let unit;
        switch (this.dates.timeframe) {
          case 'week':
            unit = 'day';
            break;
          case 'month':
            unit = 'week';
            break;
          case 'year':
          case 'alltime':
          default:
            unit = 'month';
        }
        return {
          data: [this.measurement],
          timeframe: this.dates.timeframe as MeasurementTimeframe,
          startDate: moment(this.dates.startDate).format('YYYY-MM-DD'),
          endDate: moment(this.dates.endDate).format('YYYY-MM-DD'),
          unit: unit
        };
      });
    } else {
      // let the parent take the control
      this.source.register('chart', false, this.refresh$, () => ({}));
    }

    this.chartSubscription = this.source.chart().subscribe(chart => {
      this.chart = undefined; // force refresh on change
      setTimeout(() => {
        this.chart = {};
        lodash.merge(this.chart, this.config.get('chart').factory('line'), chart);
      }, 50);
    });

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.chartSubscription.unsubscribe();
    this.source.unregister('chart');
  }

  ngOnChanges(changes) {
    if (changes.metrics) {
      this.buildMeasurements(changes.metrics.currentValue);
    }
    if (changes.views) {
      this.buildViews(changes.views.currentValue);
    }
  }

  private buildMeasurements(enabled: string[]) {
    this.measurements = this.measurementTypes.filter(v => {
      return enabled.indexOf(v.value) > -1;
    });
    if (
      this.measurements.length &&
      !lodash.filter(this.measurements, { value: this.measurement }).length
    ) {
      this.measurement = this.measurements[0].value;
    }
  }

  private buildViews(enabled: string[]) {
    this.viewby = this.viewTypes.filter(v => {
      return enabled.indexOf(v.value) > -1;
    });
    if (
      this.viewby.length &&
      !lodash.filter(this.viewby, { value: this.timeframe }).length
    ) {
      this.timeframe = this.viewby[0].value;
    }
  }

  refresh() {
    this.change.emit({
      measurement: this.measurement,
      timeframe: this.timeframe
    });
    this.cdr.detectChanges();
    if (!this.embedded) {
      this.refresh$.next('chart.refresh');
    }
  }

  updateDates(dates: DateNavigatorOutput) {
    this.dates = dates;
    this.refresh$.next(true);
  }
}
