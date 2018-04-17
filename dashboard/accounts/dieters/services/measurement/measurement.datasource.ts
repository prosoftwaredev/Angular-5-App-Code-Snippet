import { TranslateService } from '@ngx-translate/core';
import { isArray, merge } from 'lodash';
import * as moment from 'moment-timezone';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { NotifierService } from '../../../../../service';
import { _, ChartData, ChartDataSource } from '../../../../../shared';
import { APISummaryResponse, FoodSummaryValues } from '../../../../../shared/selvera-api';
import { MeasurementCriteria, MeasurementSummarySegment } from './measurement.criteria';
import { MeasurementDatabase } from './measurement.database';

export class MeasurementDataSource extends ChartDataSource<any, MeasurementCriteria> {
  langSubscription: Subscription;

  constructor(
    protected notify: NotifierService,
    protected database: MeasurementDatabase,
    private translator: TranslateService
  ) {
    super();

    // factors with translatable units
    this.buildFormatter();
    this.langSubscription = this.translator.onLangChange.subscribe(() => {
      this.buildFormatter();
    });
  }

  private buildFormatter() {
    this.translator
      .get([
        _('UNIT.LBS'),
        _('UNIT.BMI'),
        _('UNIT.STEPS'),
        _('UNIT.HOURS'),
        _('UNIT.INCHES'),
        _('UNIT.GRAMS')
      ])
      .subscribe(translations => {
        // setup the label formatters
        this.formatters = {
          weight: [translations['UNIT.LBS'], v => (v * 0.00220462).toFixed(1), true],
          bmi: [translations['UNIT.BMI'], v => (v / 1000).toFixed(1), true],
          bodyFat: ['%', v => (v / 1000).toFixed(1), true],
          leanMass: ['%', v => ((100000 - v) / 1000).toFixed(1), true],
          waterPercentage: ['%', v => (v / 1000).toFixed(1), false],
          steps: [translations['UNIT.STEPS'], v => v, true],
          average: ['', v => v, true],
          distance: ['', v => v, true],
          total: [translations['UNIT.HOURS'], v => (v / 3600).toFixed(1), true],
          sleepQuality: ['', v => v, true],
          waist: [translations['UNIT.INCHES'], v => (v * 0.0393701).toFixed(1), true],
          arm: [translations['UNIT.INCHES'], v => (v * 0.0393701).toFixed(1), true],
          chest: [translations['UNIT.INCHES'], v => (v * 0.0393701).toFixed(1), true],
          hip: [translations['UNIT.INCHES'], v => (v * 0.0393701).toFixed(1), true],
          thigh: [translations['UNIT.INCHES'], v => (v * 0.0393701).toFixed(1), true],
          calories: ['', v => v, true],
          protein: [translations['UNIT.GRAMS'], v => (v / 1000).toFixed(1), true],
          carbohydrates: [translations['UNIT.GRAMS'], v => (v / 1000).toFixed(1), true],
          totalFat: [translations['UNIT.GRAMS'], v => (v / 1000).toFixed(1), true]
        };
      });
  }

  fetch(criteria): Observable<APISummaryResponse[]> {
    return Observable.fromPromise(this.database.fetchAllSummary(criteria));
  }

  mapResult(result) {
    // TODO apply the formatter here
    if (isArray(result[0])) {
      const format = (measurement, value) => {
        return value
          ? ['month', 'year'].indexOf(this.criteria.timeframe) >= 0
            ? value.dailyAverage
            : value.total
          : 0;
      };
      return result[0].map(v => {
        return new Object({
          date: v.date,
          calories: format('calories', v.calories),
          protein: format('protein', v.protein),
          carbohydrates: format('carbohydrates', v.carbohydrates),
          totalFat: format('totalFat', v.totalFat)
        });
      });
    } else {
      const res: APISummaryResponse = merge({}, ...result);
      this.summary$.next(res.summary ? res.summary : {});
      return res.data ? res.data : [];
    }
  }

  mapChart(result: MeasurementSummarySegment[]): ChartData {
    if (!result.length) {
      return this.defaultData();
    }

    const headings = [];
    const chart = {
      type: 'line',
      datasets: [{ data: [] }],
      labels: [],
      options: {
        tooltips: {
          callbacks: {
            title: (tooltipItem, d) => {
              const i = tooltipItem[0].datasetIndex;
              const j = tooltipItem[0].index - 1; // - 1: spacer
              return headings[i][j];
            },
            label: (tooltipItem, d) => {
              const i = this.args.data[tooltipItem.datasetIndex];
              return tooltipItem.yLabel + ' ' + this.formatters[i][0]; // 0: unit
            }
          }
        }
      }
    };

    // formats
    let xlabelFormat;
    let tooltipFormat;
    switch (this.args.timeframe) {
      case 'week':
        xlabelFormat = 'ddd D';
        tooltipFormat = 'ddd, MMM D';
        break;
      case 'month':
        xlabelFormat = 'D';
        tooltipFormat = 'MMM D';
        break;
      case 'year':
        xlabelFormat = 'MMM';
        tooltipFormat = 'MMM YYYY';
      case 'alltime':
      default:
        xlabelFormat = 'MMM YYYY';
        tooltipFormat = 'MMM YYYY';
    }

    // FIXME if we're charting multiple fields, multiple axis needs to be handled

    // filter empty values if the formatted is configured to do so
    // and we're charting only one field, to keep data integrity
    if (this.args.data.length === 1) {
      const f = this.database.resolveResult(this.args.data[0]);
      result = result.filter(s => s[f]);
    }

    // labels
    chart.labels = ['', ...result.map(s => moment(s.date).format(xlabelFormat)), ''];

    // data points and headings
    let min, max;
    if (this.args.data.length) {
      chart.datasets.length = 0;
      this.args.data.map(measurement => {
        // swap any measurement dependency here
        const field = this.database.resolveResult(measurement);
        // fill the dataset
        chart.datasets.push({
          data: [
            null, // axis spacer left
            ...result.map(segment => {
              const value = this.formatters[measurement]
                ? this.formatters[measurement][1](segment[field])
                : segment[field];

              // store the min and max
              min = !min || value < min ? Math.floor(value) : min;
              max = !max || value > max ? Math.ceil(value) : max;

              return value;
            }),
            null // axis spacer right
          ]
        });
        // fill the headings
        headings.push(result.map(s => moment(s.date).format(tooltipFormat)));
      });
    }

    if (min && max) {
      // round to multiples of 10 for > 100
      min = min > 100 ? Math.round(min / 10) * 10 : min;
      max = max > 100 ? Math.round(max / 10) * 10 : max;

      chart.options['scales'] = {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
              min: Math.max(0, Math.round(min - max * 0.1)),
              max: Math.round(max * 1.1),
              callback: function(value, index, values) {
                return !index || index === values.length - 1 ? '' : value;
              }
            }
          }
        ]
      };
    }

    return merge(super.defaultData(), chart);
  }
}
