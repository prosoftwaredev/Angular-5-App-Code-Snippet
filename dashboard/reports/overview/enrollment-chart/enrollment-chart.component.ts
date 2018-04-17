import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { findIndex, merge } from 'lodash';
import { unitOfTime } from 'moment';
import * as moment from 'moment-timezone';
import { BaseChartDirective } from 'ng2-charts';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {
  CCRService,
  ClinicSelectorItem,
  ConfigService,
  NotifierService
} from '../../../../service';
import {
  _,
  ChartData,
  ChartDataSource,
  DateRangeNavigatorOutput,
  SelectOptions,
  ViewUtils
} from '../../../../shared';
import {
  EnrollmentReportsDataSource,
  ReportsDatabase,
  ReportsTimeframe
} from '../../services';

@Component({
  selector: 'app-reports-enrollment-chart',
  templateUrl: './enrollment-chart.component.html',
  styleUrls: ['./enrollment-chart.component.scss'],
  host: { class: 'ccr-chart' }
})
export class EnrollmentChartComponent implements OnInit {
  source: EnrollmentReportsDataSource;
  csvSeparator = ',';

  // clinics for dropdown
  clinics: ClinicSelectorItem[] = [];
  clinic: string;

  @ViewChild(BaseChartDirective) myChart: BaseChartDirective;
  chart: ChartData;
  chartSubscription: Subscription;

  // dates range navigator store
  dates: DateRangeNavigatorOutput = {
    endDate: moment().format('YYYY-MM-DD'),
    startDate: moment()
      .subtract(1, 'week')
      .format('YYYY-MM-DD')
  };
  _maxDiff = moment.duration(1, 'year');
  _max = moment();

  // refresh chart trigger
  refresh$ = new Subject<boolean>();

  constructor(
    private cdr: ChangeDetectorRef,
    private ccr: CCRService,
    private config: ConfigService,
    private notifier: NotifierService,
    private database: ReportsDatabase,
    private translator: TranslateService,
    private viewUtils: ViewUtils
  ) {
    this.source = new EnrollmentReportsDataSource(
      this.notifier,
      this.database,
      this.translator,
      this.config,
      this.viewUtils
    );
  }

  ngOnInit() {
    this.source.addRequired(this.refresh$, () => {
      // adjust the unit according to the date-range diff
      let unit: unitOfTime.DurationConstructor;
      switch (true) {
        case this.dates.diff > 14:
          unit = 'month';
          break;
        default:
          unit = 'day';
      }
      // calculate units here according range interval
      return {
        organization: this.clinic,
        startDate: moment(this.dates.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.dates.endDate).format('YYYY-MM-DD'),
        unit: unit
      };
    });

    this.chartSubscription = this.source.chart().subscribe(chart => {
      this.chart = undefined; // force refresh on change
      setTimeout(() => {
        this.chart = {};
        merge(this.chart, this.config.get('chart').factory('bar'), chart);
      }, 50);
    });

    // setup the clinics selector
    this.ccr
      .clinicSelector()
      .then(clinics => {
        this.clinics = clinics;
        // select the first organization with enough permissions
        const idx = findIndex(clinics, { permissions: { accessall: true } });
        const clinic = this.clinics.length
          ? idx !== -1 ? this.clinics[idx].value : this.clinics[0].value
          : null;
        this.selectClinic(clinic);
      })
      .catch(err => this.notifier.error(err));

    this.cdr.detectChanges();
  }

  selectClinic(value) {
    this.clinic = value;
    this.refresh$.next(true);
  }

  updateDates(dates: DateRangeNavigatorOutput) {
    this.dates = dates;
    if (this.clinic) {
      // refresh only if there's a clinic setted up
      this.refresh$.next(true);
    }
    // prevents exception when loading date-range values
    this.cdr.markForCheck();
  }

  refresh() {
    this.refresh$.next(true);
  }

  downloadCSV() {
    const dates = this.chart.datasets[0].data.filter(d => d.x).map(d => d.x);
    const ini = moment(dates[0]).format(this.dates.format);
    const end = moment(dates[dates.length - 1]).format(this.dates.format);
    const orgName = this.chart.datasets[0].data[1].org;
    const filename = `${orgName}_enrollments_${dates[0]}_${dates[dates.length - 1]}.csv`;

    // english only file
    let csv = '';
    csv += 'DIETER PHASE ENROLLMENT\r\n';
    csv += `${orgName}: ${ini} - ${end}` + '\r\n';
    csv += 'Enrollments' + this.csvSeparator;
    csv +=
      dates.map(d => moment(d).format(this.dates.format)).join(this.csvSeparator) +
      '\r\n';
    this.chart.datasets.forEach(d => {
      csv += d.label;
      d.data.filter(o => o.x).forEach(r => {
        csv += this.csvSeparator + r.y;
      });
      csv += '\r\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('visibility', 'hidden');
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
