import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UnitFormatters } from '../utils';
import { TableDataSource } from './table.datasource';

export interface ChartData {
  type?: string;
  data?: any[];
  datasets?: any[];
  labels?: Array<any>;
  options?: object;
  colors?: Array<any>;
  legend?: boolean;
}

export abstract class ChartDataSource<T, C> extends TableDataSource<T, any, C> {
  /**
   * Observable of data summary of the resulting query.
   */
  summary$ = new BehaviorSubject<any>({});

  /**
   * Config defaults manipulable from outside.
   */
  settings: ChartData = {
    type: 'line',
    legend: true,
    colors: undefined
  };

  /**
   * Labels unit processors.
   */
  formatters: UnitFormatters = {};

  /**
   * Connects a charting component to this data source. Note that
   * the stream provided will be accessed during change detection and should not directly change
   * values that are bound in template views.
   * @returns Observable that emits a new value when the data changes.
   */
  chart(): Observable<ChartData> {
    return this.connect().map(this.mapChart.bind(this));
  }

  defaultData(): ChartData {
    return Object.assign(
      {
        datasets: [{ data: [] }],
        labels: []
      },
      this.settings
    );
  }

  abstract mapChart(result: T[]): ChartData;
}
