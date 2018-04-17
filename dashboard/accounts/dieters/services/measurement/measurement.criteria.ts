import {
  ActivitySummaryData,
  ActivitySummaryUnit,
  BodySummaryData,
  BodySummaryDataResponseSegment,
  BodySummaryUnit,
  FoodSummaryData,
  SleepSummaryData,
  SleepSummaryUnit,
  SummaryActivityResponseSegment,
  SummarySleepMeasurementResponseSegment
} from '../../../../../shared/selvera-api';

export type MeasurementTimeframe = 'alltime' | 'year' | 'month' | 'week' | 'day';

export type MeasurementSummaryUnit =
  | ActivitySummaryUnit
  | BodySummaryUnit
  | SleepSummaryUnit;

export type MeasurementSummaryData =
  | ActivitySummaryData
  | BodySummaryData
  | FoodSummaryData
  | SleepSummaryData
  | 'leanMass'
  | 'date';

export type MeasurementSummarySegment =
  | SummaryActivityResponseSegment
  | BodySummaryDataResponseSegment
  | SummarySleepMeasurementResponseSegment;

export interface MeasurementCriteria {
  // common request
  account: string;
  startDate: string;
  endDate: string;
  max?: number;
  // fetch
  direction?: 'asc' | 'desc';
  // summary
  data?: Array<MeasurementSummaryData>;
  unit?: MeasurementSummaryUnit;
  // controls
  timeframe: MeasurementTimeframe;
  measurement: MeasurementSummaryData;
}
