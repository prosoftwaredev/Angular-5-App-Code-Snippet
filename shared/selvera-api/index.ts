export * from './message';
export * from './units';

export { Goal } from 'selvera-api/dist/lib';
export {
  FetchAllAccountRequest,
  SubmitAvatarRequest
} from 'selvera-api/dist/lib/selvera-api/providers/account/requests';
export {
  FetchAllAccountResponse,
  FetchAllAccountObjectResponse,
  FetchSingleAccountResponse,
  SearchResultAccount
} from 'selvera-api/dist/lib/selvera-api/providers/account/responses';
export {
  FetchAllConsumedRequest,
  SummaryDataOption as FoodSummaryData,
  FetchSummaryRequest as FetchFoodSummaryRequest
} from 'selvera-api/dist/lib/selvera-api/providers/food/requests';
export {
  FetchAllConsumedMealIngredients,
  FetchAllConsumedResponse,
  FetchAllSingleConsumedMealResponse,
  SummaryDataResponse
} from 'selvera-api/dist/lib/selvera-api/providers/food/responses';
export {
  FetchGoalResponse
} from 'selvera-api/dist/lib/selvera-api/providers/goal/responses';
export {
  GetHydrationSummaryRequest
} from 'selvera-api/dist/lib/selvera-api/providers/hydration/requests';
export {
  HydrationSummaryResponse
} from 'selvera-api/dist/lib/selvera-api/providers/hydration/responses';
export {
  ActivitySummaryData,
  ActivitySummaryUnit,
  AddActivityRequest,
  FetchActivityRequest,
  FetchActivitySummaryRequest
} from 'selvera-api/dist/lib/selvera-api/providers/measurement/activity/requests';
export {
  FetchActivityResponse,
  FetchActivitySummaryResponse,
  SummaryActivityResponseSegment
} from 'selvera-api/dist/lib/selvera-api/providers/measurement/activity/responses';
export {
  AddBodyMeasurementRequest,
  BodySummaryData,
  BodySummaryUnit,
  FetchBodySummaryRequest,
  FetchBodyMeasurementRequest
} from 'selvera-api/dist/lib/selvera-api/providers/measurement/body/requests';
export {
  BodySummaryDataResponseSegment,
  FetchBodySummaryResponse,
  FetchBodyMeasurementResponse
} from 'selvera-api/dist/lib/selvera-api/providers/measurement/body/responses';
export {
  AddManualSleepMeasurementRequest,
  AddSleepMeasurementRequest,
  FetchSleepMeasurementSummaryRequest,
  FetchSleepMeasurementRequest,
  SleepSummaryData,
  SleepSummaryUnit
} from 'selvera-api/dist/lib/selvera-api/providers/measurement/sleep/requests';
export {
  FetchSleepMeasurementResponse,
  FetchSleepMeasurementSummaryResponse,
  SummarySleepMeasurementResponseSegment
} from 'selvera-api/dist/lib/selvera-api/providers/measurement/sleep/responses';
export {
  AddMessageRequest,
  AddThreadRequest,
  FetchAllThreadRequest,
  FetchUserThreadsRequest,
  FetchSingleThreadRequest
} from 'selvera-api/dist/lib/selvera-api/providers/message/requests';
export {
  AddMessageResponse,
  FetchAllThreadResponse,
  FetchSingleThreadResponse,
  FetchUnreadThreadResponse,
  FetchUserThreadsResponse,
  SingleMessageResponse,
  SingleThreadResponse,
  SingleUserThreadResponse
} from 'selvera-api/dist/lib/selvera-api/providers/message/responses';
export {
  FetchClientAssociationResponse,
  FetchCoachAssociationResponse
} from 'selvera-api/dist/lib/selvera-api/providers/organizationAssociation/responses';
export {
  FetchAllConsumptionRequest,
  FetchSupplementAccountAssociationRequest,
  FetchSupplementSummaryRequest
} from 'selvera-api/dist/lib/selvera-api/providers/supplement/requests';
export {
  FetchAllConsumptionResponse,
  FetchAllConsumptionSegment,
  FetchSupplementAccountAssociationResponse,
  FetchSupplementAssociationResponse,
  FetchSupplementsResponse,
  FetchSupplementsSegment,
  FetchSupplementSummaryResponse,
  OrganizationSupplements,
  SupplementDataResponseSegment
} from 'selvera-api/dist/lib/selvera-api/providers/supplement/responses';
export {
  TimezoneResponse
} from 'selvera-api/dist/lib/selvera-api/providers/timezone/responses';
export {
  Profile,
  UpdateRequest
} from 'selvera-api/dist/lib/selvera-api/providers/user/requests';
export {
  AddAttendeeRequest,
  AddMeetingRequest,
  AddRecurrentAvailabilityRequest,
  AddSingleAvailabilityRequest,
  FetchAllMeetingRequest,
  FetchCalendarAvailabilityRequest,
  FetchProviderAvailabilityRequest,
  FetchSummaryRequest,
  SearchProviderAvailabilityRequest,
  SetTimezoneRequest,
  UpdateAttendanceRequest,
  UpdateMeetingRequest
} from 'selvera-api/dist/lib/selvera-api/providers/schedule/requests';
export {
  AddMeetingResponse,
  AddRecurrentAvailabilityResponse,
  AddSingleAvailabilityResponse,
  FetchAllMeetingResponse,
  FetchAvailabilityResponse,
  FetchCalendarAvailabilityResponse,
  FetchCalendarAvailabilitySegment,
  FetchMeetingResponse,
  FetchMeetingTypesResponse,
  FetchProviderAvailabilitySegment,
  FetchRecurrentAvailabilitySegment,
  FetchSummaryResponse,
  SearchProviderAvailabilityResponse
} from 'selvera-api/dist/lib/selvera-api/providers/schedule/responses';
export {
  MeetingAttendee,
  MeetingType,
  MeetingLocationRequest,
  MeetingLocation
} from 'selvera-api/dist/lib/selvera-api/providers/schedule/entities';

export {
  ConsultationListingRequest,
  ConsultationCreateRequest
} from 'selvera-api/dist/lib/selvera-api/providers/consultation/requests';
export {
  ConsultationListingResponse
} from 'selvera-api/dist/lib/selvera-api/providers/consultation/responses';
export {
  TimelineUnit
} from 'selvera-api/dist/lib/selvera-api/providers/reports/entities';
export {
  EnrollmentSnapshotRequest,
  EnrollmentTimelineRequest,
  SignupsSnapshotRequest,
  SignupsTimelineRequest,
  NotificationRequest,
  NotificationToggleRequest
} from 'selvera-api/dist/lib/selvera-api/providers/reports/requests';
export {
  EnrollmentAggregate,
  EnrollmentSnapshotSegment,
  EnrollmentTimelineSegment,
  SignupsAggregate,
  SignupsSnapshotSegment,
  SignupsTimelineSegment,
  TimelineEnrollments,
  ReportNotification
} from 'selvera-api/dist/lib/selvera-api/providers/reports/responses';

/**
 * API interfaces.
 */
export interface APISummaryResponse {
  data: Array<any>;
  summary: { [data: string]: any };
}

/**
 * Required mapping of type possible values.
 * https://github.com/Microsoft/TypeScript/issues/17061
 */
export const BodySummaryValues = [
  'weight',
  'bmi',
  'fatFreeMass',
  'bodyFat',
  'fatMassWeight',
  'bloodPressureDiastolic',
  'bloodPressureSystolic',
  'heartRate',
  'bloodOxygenLevel',
  'boneWeight',
  'basalMetabolicRate',
  'musclePercentage',
  'visceralFatPercentage',
  'waterPercentage',
  'waist',
  'arm',
  'hip',
  'chest',
  'thigh'
];
export const ActivitySummaryValues = ['steps', 'distance'];
export const SleepSummaryValues = ['total', 'average', 'sleepQuality'];
export const FoodSummaryValues = [
  'calories',
  'protein',
  'carbohydrates',
  'fiber',
  'sugar',
  'potassium',
  'sodium',
  'totalFat',
  'saturatedFat',
  'cholesterol'
];
