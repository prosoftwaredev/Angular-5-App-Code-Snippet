import { Injectable } from '@angular/core';
import { Reports } from 'selvera-api';
import { CcrDatabase } from '../../../shared';
import {
  EnrollmentSnapshotRequest,
  EnrollmentSnapshotSegment,
  EnrollmentTimelineRequest,
  EnrollmentTimelineSegment,
  SignupsSnapshotRequest,
  SignupsSnapshotSegment,
  SignupsTimelineRequest,
  SignupsTimelineSegment
} from '../../../shared/selvera-api';

@Injectable()
export class ReportsDatabase extends CcrDatabase {
  constructor(private reports: Reports) {
    super();
  }

  // fetchEnrollmentReport(
  //   args: EnrollmentReportRequest
  // ): Promise<EnrollmentReportResponse> {
  //   const request: EnrollmentReportRequest = {
  //     organization: args.organization,
  //     date: args.date,
  //     includeInactiveEnrollments: args.includeInactiveEnrollments ? args.includeInactiveEnrollments : undefined,
  //     includeInactivePackages: args.includeInactivePackages ? args.includeInactivePackages : undefined,
  //   };

  //   return this.reports.fetchEnrollmentReport(request);
  // }

  fetchEnrollmentTimelineReport(
    args: EnrollmentTimelineRequest
  ): Promise<Array<EnrollmentTimelineSegment>> {
    const request: EnrollmentTimelineRequest = {
      organization: args.organization,
      startDate: args.startDate,
      endDate: args.endDate,
      detailed: args.detailed ? args.detailed : false,
      unit: args.unit ? args.unit : undefined
    };

    return this.reports.fetchEnrollmentTimeline(request);
  }

  fetchSignupsTimelineReport(
    args: SignupsTimelineRequest
  ): Promise<Array<SignupsTimelineSegment>> {
    const request: SignupsTimelineRequest = {
      organization: args.organization,
      startDate: args.startDate,
      endDate: args.endDate,
      detailed: args.detailed ? args.detailed : false,
      unit: args.unit ? args.unit : undefined
    };

    return this.reports.fetchSignupsTimeline(request);
  }
}
