import { TranslateService } from '@ngx-translate/core';
import { find, isArray, isEmpty, map, merge, zipObject } from 'lodash';
import * as moment from 'moment-timezone';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ConfigService, NotifierService } from '../../../service';
import {
  _,
  ChartData,
  ChartDataSource,
  TranslationsObject,
  ViewUtils
} from '../../../shared';
import {
  SignupsSnapshotRequest,
  SignupsSnapshotSegment,
  SignupsTimelineRequest,
  SignupsTimelineSegment
} from '../../../shared/selvera-api';
import { ReportsDatabase } from './reports.database';

export class SignupsReportsDataSource extends ChartDataSource<
  SignupsTimelineSegment,
  SignupsTimelineRequest
> {
  translations: TranslationsObject;

  constructor(
    protected notify: NotifierService,
    protected database: ReportsDatabase,
    private translator: TranslateService,
    private config: ConfigService,
    private viewUtils: ViewUtils
  ) {
    super();

    this.translator.get([_('GRAPH.SIGNUPS')]).subscribe(translations => {
      this.translations = translations;
    });
  }

  fetch(criteria): Observable<Array<SignupsTimelineSegment>> {
    return Observable.fromPromise(this.database.fetchSignupsTimelineReport(criteria));
  }

  mapResult(result: SignupsTimelineSegment[]) {
    return result;
  }

  mapChart(result: SignupsTimelineSegment[]): ChartData {
    if (!result.length) {
      return super.defaultData();
    }

    const headings = [];
    const chart: ChartData = {
      type: 'bar',
      colors: [],
      datasets: [{ data: [] }],
      labels: [],
      options: {
        legend: {
          display: true
        },
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              stacked: true
            }
          ]
        },
        tooltips: {
          mode: 'label',
          displayColors: false,
          callbacks: {
            title: (tooltipItem, d) => {
              const i = tooltipItem[0].datasetIndex;
              const j = tooltipItem[0].index - 1; // - 1: spacer
              return headings[i][j].date;
            },
            label: (tooltipItem, d) => {
              const i = tooltipItem.datasetIndex;
              const j = tooltipItem.index - 1;
              const value = this.viewUtils.formatNumber(tooltipItem.yLabel);
              return value !== '0'
                ? `${value} ${this.translations['GRAPH.SIGNUPS']}`
                : '';
            }
          }
        }
      }
    };

    // formats
    let xlabelFormat;
    let tooltipFormat;
    switch (this.args.unit) {
      case 'day':
        xlabelFormat = 'ddd D';
        tooltipFormat = 'ddd, MMM D';
        break;
      case 'month':
        xlabelFormat = 'MMM, YYYY';
        tooltipFormat = 'MMM, YYYY';
        break;
    }

    // sort data based on date
    result.sort((a, b) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0));

    const dateArray = [];

    const endDate = moment(this.criteria.endDate);
    const currentDate = moment(this.criteria.startDate);
    while (currentDate <= endDate) {
      dateArray.push(currentDate.format('YYYY-MM-DD'));
      // custom handling of time diff
      const xAxisUnit = this.criteria.unit === 'day' ? 'days' : 'months';
      currentDate.add(1, xAxisUnit);
      xAxisUnit === 'months' && currentDate.startOf('month');
    }

    // data points and headings
    let max;
    const data = [];
    const orgs = [];
    result.forEach(segment => {
      const date = segment.date;
      let total = 0;
      segment.aggregates.forEach(aggregate => {
        const org = aggregate.organization;
        const count = Number(aggregate.signUps);
        total += count;

        data.push({
          x: date,
          y: count,
          title: org.name.trim(),
          id: org.id
        });
        orgs.indexOf(org.name) === -1 ? orgs.push(org.name) : () => {}; // no-op of typescript
      });
      // store the min and max
      max = !max || total > max ? Math.ceil(total) : max;
    });

    if (max) {
      chart.options['scales']['yAxes'][0]['ticks'] = {
        beginAtZero: true,
        min: 0,
        max: max * 1.1,
        callback: function(value: number, index: number, values: number[]) {
          // do not display the last value
          return !index || index === values.length - 1 ? '' : value.toFixed(1);
        }
      };
    }

    const obj = zipObject(orgs, map(orgs, () => []));

    data.map(s => obj[s.title].push(s));

    Object.keys(obj).map((e, i) => {
      const arr = obj[e];
      dateArray.map(date => {
        !find(arr, o => o.x === date) && arr.push({ x: date, y: 0, title: '' });
        arr.sort((a, b) => (a.x > b.x ? 1 : b.x > a.x ? -1 : 0));
      });
    });

    if (!isEmpty(obj)) {
      chart.datasets.length = 0;
      Object.keys(obj).map((org, i) => {
        chart.datasets.push({
          label: org,
          data: ['', ...obj[org], '']
        });
        chart.colors.push({
          backgroundColor: this.config.get('colors').get(i),
          hoverBackgroundColor: this.config.get('colors').get(i, 'contrast')
        });
        headings.push(
          obj[org].map(s => {
            return {
              date: moment(s.x).format(tooltipFormat),
              title: s.title,
              count: s.y
            };
          })
        );
      });
    }

    // labels
    chart.labels = ['', ...dateArray.map(s => moment(s).format(xlabelFormat)), ''];

    return merge(super.defaultData(), chart);
  }
}
