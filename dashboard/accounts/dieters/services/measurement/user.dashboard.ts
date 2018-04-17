import { Injectable } from '@angular/core';
import { has, mergeWith } from 'lodash';
import { IPSummaryData } from 'selvera-api';
import { ContextService, NotifierService } from '../../../../../service';
import {
  FetchBodyMeasurementRequest,
  FetchBodyMeasurementResponse
} from '../../../../../shared/selvera-api';
import { DieterDataService } from '../data.service';
import { MeasurementSummaryData } from './measurement.criteria';

import * as momentNs from 'moment-timezone';
const moment = momentNs;

@Injectable()
export class UserDashboardDatabase {
  isLoading = true;
  isBMRLoading = true;

  BMR: number;
  haveBMRData = false;
  starting: any = {};
  current: any = {};

  reqFields = ['bmi', 'bodyFat', 'waterPercentage', 'weight'];

  constructor(
    private context: ContextService,
    private notifier: NotifierService,
    private dieterDataService: DieterDataService,
    private ipSummaryData: IPSummaryData
  ) {}

  init(activityLevel: number): void {
    this.getMetricData();
    this.getBMRStat(activityLevel);
  }

  update(activityLevel: number): void {
    this.getBMRStat(activityLevel);
  }

  private getBMRStat(activityLevel: number): void {
    this.isBMRLoading = true;
    // get bmr value for dieter based on activity level
    this.ipSummaryData
      .dieterSummary(this.context.dieterId, activityLevel)
      .then(res => {
        this.BMR = res.bmr;
        this.haveBMRData = true;
        this.isBMRLoading = false;
      })
      .catch(err => {
        this.haveBMRData = false;
        this.isBMRLoading = false;
        this.notifier.error(err);
      });
  }

  private getMetricData(): void {
    // starting metrics request

    // FIXME get a summary from measurement v3
    const starting: FetchBodyMeasurementRequest = {
      account: this.context.dieterId,
      // TODO include start date from current Phase if exists
      max: 50,
      direction: 'asc'
    };

    // FIXME get a summary from measurement v3
    const current: FetchBodyMeasurementRequest = {
      account: this.context.dieterId,
      startDate: moment()
        .subtract(90, 'days')
        .format('YYYY-MM-DD'),
      max: 50,
      direction: 'desc'
    };

    Promise.all([
      this.dieterDataService.getDashMetricsData(starting),
      this.dieterDataService.getDashMetricsData(current)
    ])
      .then(([start, curr]) => {
        this.populateData('starting', this.filterData(start));
        this.populateData('current', this.filterData(curr));
        this.isLoading = false;
      })
      .catch(err => this.notifier.error(err));
  }

  private populateData(field: string, record: FetchBodyMeasurementResponse): void {
    this[field].weight = record.weight ? (record.weight * 0.00220462).toFixed(1) : null;
    this[field].BMI = record.bmi ? (record.bmi / 1000).toFixed(1) : null;
    this[field].bodyFat = record.bodyFat ? (record.bodyFat / 1000).toFixed(1) : null;

    this[field].leanMass =
      record.weight && record.bodyFat
        ? ((record.weight - record.bodyFat) / 1000).toFixed(1)
        : null;

    this[field].waterMass = record.waterPercentage
      ? record.weight * (record.waterPercentage / 100000) * 0.0022046
      : null;
  }

  private filterData(res: Array<FetchBodyMeasurementResponse>) {
    const result = {};
    let record;

    // reducer to check if all the reqFields are collected
    const checker = (complete, field) => {
      return complete && has(result, field);
    };

    // consume the data until all the data is collected
    while (res.length > 0) {
      record = res.shift();
      this.reqFields.forEach(field => {
        if (!result[field] && record[field]) {
          result[field] = record[field];
        }
      });
      // merge other measurements present
      mergeWith(result, record, (a, b) => (a !== null ? a : undefined));
      // check if the required are complete
      if (this.reqFields.reduce(checker, true)) {
        break;
      }
    }

    return result as FetchBodyMeasurementResponse;
  }
}
