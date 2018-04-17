import { Injectable } from '@angular/core';
import { MeasurementActivity, MeasurementBody, MeasurementSleep } from 'selvera-api';
import {
  FetchActivitySummaryRequest,
  FetchActivitySummaryResponse,
  FetchBodyMeasurementRequest,
  FetchBodyMeasurementResponse,
  FetchBodySummaryRequest,
  FetchBodySummaryResponse,
  FetchSleepMeasurementSummaryRequest,
  FetchSleepMeasurementSummaryResponse
} from './../../../../shared/selvera-api';

@Injectable()
export class DieterDataService {
  constructor(
    private measurementBody: MeasurementBody,
    private measurementActivity: MeasurementActivity,
    private measurementSleep: MeasurementSleep
  ) {}

  //
  // get data for chart on patient dashboard
  //
  public getDashChartData(
    request: FetchBodySummaryRequest
  ): Promise<FetchBodySummaryResponse> {
    return this.measurementBody.fetchSummary(request);
  }

  //
  // get data for showing current and starting Weight, Body Fat and BMI
  //
  public getDashMetricsData(
    request: FetchBodyMeasurementRequest
  ): Promise<FetchBodyMeasurementResponse[]> {
    return this.measurementBody.fetchBodyMeasurement(request);
  }

  //
  // get summary data for Measurement Activity
  //
  public getActivitySummary(
    request: FetchActivitySummaryRequest
  ): Promise<FetchActivitySummaryResponse> {
    return this.measurementActivity.fetchSummary(request);
  }

  //
  // get summary data for Sleep
  //
  public getSleepSummary(
    request: FetchSleepMeasurementSummaryRequest
  ): Promise<FetchSleepMeasurementSummaryResponse> {
    return this.measurementSleep.fetchSummary(request);
  }
}
